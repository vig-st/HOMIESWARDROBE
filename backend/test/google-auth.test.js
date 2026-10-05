const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { googleSignIn, login, register } = require('../controllers/authController');

const originalVerifyIdToken = OAuth2Client.prototype.verifyIdToken;
const originalFindOne = User.findOne;
const originalFindById = User.findById;
const originalCreate = User.create;
const originalGoogleClientId = process.env.GOOGLE_CLIENT_ID;
const originalJwtSecret = process.env.JWT_SECRET;
const jwtSecret = 'google-auth-test-secret';

test.before(() => {
  process.env.GOOGLE_CLIENT_ID = 'test-client-id';
  process.env.JWT_SECRET = jwtSecret;
});

test.after(() => {
  OAuth2Client.prototype.verifyIdToken = originalVerifyIdToken;
  User.findOne = originalFindOne;
  User.findById = originalFindById;
  User.create = originalCreate;
  if (originalGoogleClientId === undefined) delete process.env.GOOGLE_CLIENT_ID;
  else process.env.GOOGLE_CLIENT_ID = originalGoogleClientId;
  if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalJwtSecret;
});

const makeResponse = () => ({
  statusCode: 200,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    this.data = data;
    return this;
  },
});

const verifiedProfile = (overrides = {}) => ({
  sub: 'google-subject-id',
  email: 'customer@example.com',
  email_verified: true,
  name: 'Google Customer',
  ...overrides,
});

const stubGoogleVerification = (profile) => {
  OAuth2Client.prototype.verifyIdToken = async (options) => {
    assert.equal(options.idToken, 'signed-google-credential');
    assert.equal(options.audience, 'test-client-id');
    return { getPayload: () => profile };
  };
};

const requestGoogleSignIn = () => googleSignIn(
  { body: { credential: 'signed-google-credential' } },
  makeResponse(),
);

test('Google sign-in rejects unverifiable and unverified credentials', async (t) => {
  await t.test('rejects an invalid credential without looking up a user', async () => {
    OAuth2Client.prototype.verifyIdToken = async () => { throw new Error('invalid token'); };
    User.findOne = async () => assert.fail('invalid credentials must not query users');
    const response = makeResponse();

    await googleSignIn({ body: { credential: 'signed-google-credential' } }, response);

    assert.equal(response.statusCode, 401);
    assert.equal(response.data.message, 'Google sign-in could not be verified');
  });

  await t.test('rejects an unverified email', async () => {
    stubGoogleVerification(verifiedProfile({ email_verified: false }));
    User.findOne = async () => assert.fail('unverified emails must not query users');
    const response = await requestGoogleSignIn();

    assert.equal(response.statusCode, 401);
    assert.equal(response.data.message, 'Google sign-in could not be verified');
  });
});

test('Google sign-in creates a customer with verified profile fields and an application JWT', async () => {
  stubGoogleVerification(verifiedProfile({ email: 'Customer@Example.com' }));
  let createdFields;
  User.findOne = async ({ email }) => {
    assert.ok(email instanceof RegExp);
    assert.ok(email.test('customer@example.com'));
    return null;
  };
  User.create = async (fields) => {
    createdFields = fields;
    return { _id: 'new-customer-id', ...fields };
  };
  const response = await requestGoogleSignIn();

  assert.equal(response.statusCode, 200);
  assert.equal(response.data._id, 'new-customer-id');
  assert.equal(response.data.email, 'customer@example.com');
  assert.equal(response.data.name, 'Google Customer');
  assert.equal(response.data.role, 'customer');
  assert.ok(response.data.token);
  assert.equal(jwt.verify(response.data.token, jwtSecret).id, 'new-customer-id');
  assert.equal(Object.hasOwn(createdFields, 'password'), false);
  assert.equal(Object.hasOwn(createdFields, 'sub'), false);
  assert.equal(Object.hasOwn(response.data, 'password'), false);

  let selectedFields;
  User.findById = (id) => ({
    select: async (fields) => {
      selectedFields = fields;
      return { _id: id, name: 'Google Customer', email: 'customer@example.com', role: 'customer' };
    },
  });
  const protectedRequest = { headers: { authorization: `Bearer ${response.data.token}` } };
  const protectedResponse = makeResponse();
  let nextCalled = false;
  await protect(protectedRequest, protectedResponse, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.equal(protectedRequest.user._id, 'new-customer-id');
  assert.equal(selectedFields, '-password');
});

test('customer schema accepts Google accounts without passwords', async () => {
  const googleUser = new User({
    name: 'Google Customer',
    email: 'customer@example.com',
    role: 'customer',
  });

  await assert.doesNotReject(googleUser.validate());
});

test('Google sign-in reuses an existing customer instead of creating another', async () => {
  stubGoogleVerification(verifiedProfile());
  const existingUser = {
    _id: 'existing-customer-id',
    name: 'Existing Customer',
    email: 'customer@example.com',
    role: 'customer',
  };
  User.findOne = async () => existingUser;
  User.create = async () => assert.fail('existing customers must not be duplicated');
  const response = await requestGoogleSignIn();

  assert.equal(response.statusCode, 200);
  assert.equal(response.data._id, 'existing-customer-id');
  assert.equal(response.data.name, 'Existing Customer');
});

test('Google sign-in recovers from a concurrent duplicate-key account creation', async () => {
  stubGoogleVerification(verifiedProfile());
  const existingUser = {
    _id: 'racing-customer-id',
    name: 'Racing Customer',
    email: 'customer@example.com',
    role: 'customer',
  };
  let lookupCount = 0;
  User.findOne = async () => (lookupCount++ === 0 ? null : existingUser);
  User.create = async () => {
    const error = new Error('duplicate key');
    error.code = 11000;
    throw error;
  };
  const response = await requestGoogleSignIn();

  assert.equal(response.statusCode, 200);
  assert.equal(response.data._id, 'racing-customer-id');
  assert.equal(lookupCount, 2);
});

test('email registration and password login continue to use the existing JWT contract', async () => {
  let createdUser;
  User.findOne = async ({ email }) => {
    assert.ok(email instanceof RegExp);
    return createdUser;
  };
  User.create = async (fields) => {
    createdUser = { _id: 'password-customer-id', ...fields };
    return createdUser;
  };

  const registration = makeResponse();
  await register({ body: { name: 'Password Customer', email: 'Customer@Example.com', password: 'password123' } }, registration);
  assert.equal(registration.statusCode, 201);
  assert.equal(createdUser.email, 'customer@example.com');
  assert.ok(await bcrypt.compare('password123', createdUser.password));

  const loginResponse = makeResponse();
  await login({ body: { email: 'CUSTOMER@example.com', password: 'password123' } }, loginResponse);
  assert.equal(loginResponse.statusCode, 200);
  assert.equal(loginResponse.data._id, 'password-customer-id');
  assert.equal(jwt.verify(loginResponse.data.token, jwtSecret).id, 'password-customer-id');
});

test('password login rejects Google-only users without a stored password', async () => {
  User.findOne = async () => ({
    _id: 'google-only-customer-id',
    email: 'customer@example.com',
    role: 'customer',
  });
  const response = makeResponse();

  await login({ body: { email: 'customer@example.com', password: 'anything' } }, response);

  assert.equal(response.statusCode, 401);
  assert.equal(response.data.message, 'Invalid email or password');
});