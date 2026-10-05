# Atlas connection diagnosis

Checked on 2026-09-26, approximately 13:39-13:48 UTC.

**Classification: TRANSIENT/UNCONFIRMED**

The current failure occurs during TLS negotiation, before database authentication.
It reproduces without application models or Mongoose. No concrete application
configuration regression was identified. The precise cause remains unconfirmed
without checking the Atlas project and the network path.

## Results

| Check | Result |
| --- | --- |
| Normal startup | `npm start` fails safely before listening |
| Node | v24.19.0; OpenSSL 3.5.7 |
| npm | 11.17.0 |
| Mongoose | 9.9.4 |
| MongoDB driver | 7.5.0, as resolved by Mongoose |
| OS | Windows 10 Pro, 10.0.19045, x64 |
| Dependency lock | Installed versions and manifest dependency declarations match backend/package-lock.json |
| MONGO_URI loaded | YES; valid URI syntax; no value printed |
| dotenv | One call in normal startup; no override:true; runtime value matches backend/.env; no duplicate assignment or surrounding whitespace |
| Other dotenv calls | Standalone seed/test scripts also load dotenv; these are not extra loads in normal startup |
| Atlas Network Access | Unverified: dashboard access is needed to check the active IP list and cluster status |
| DNS | Node 24 SRV lookup resolves three hosts; all host lookups succeed; system IPv4 resolution matches DNS A records |
| TCP | Connections to port 27017 succeed on all three hosts, including explicit IPv4 probes |
| TLS | All three hosts reject certificate-verified TLS with alert 80, on default and IPv4-only paths |
| Mongoose connection | MongooseServerSelectionError caused by MongoNetworkError / ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR |
| Official driver connection | MongoServerSelectionError caused by the same TLS error |
| System clock | Approximately 5-7 seconds from an HTTPS server Date header, consistent with independent UTC time; Windows Time service is stopped |
| Proxy environment | HTTP_PROXY, HTTPS_PROXY and ALL_PROXY set in the diagnostic process; absent from persistent User/Machine environment |
| Other environment | NODE_EXTRA_CA_CERTS, NODE_OPTIONS and NODE_TLS_REJECT_UNAUTHORIZED unset |
| WinHTTP proxy | Direct access; no proxy configured |
| VPN/security inspection | No connected Windows VPN listed; Wi-Fi active; Windows Defender reported; interception elsewhere cannot be ruled out |
| Spaced attempts | Normal startup, Mongoose and two separate Node 24 driver attempts failed; no recovery observed |

Relevant underlying TLS text:

    ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR
    ssl3_read_bytes:tlsv1 alert internal error
    SSL alert number 80

## Runtime comparison

The already-installed Node 20.20.2 and Node 24.18.0 executables were tested without
changing the selected Node installation or any dependencies.

Node 20's first driver attempt failed during SRV lookup with ECONNREFUSED. To
separate that from TLS, a subsequent TLS-only comparison used one IPv4 address
resolved by Node 24, with the correct Atlas hostname supplied for SNI and
certificate verification. Both Node 20.20.2 (OpenSSL 3.0.19) and Node 24.18.0
(OpenSSL 3.5.7) received the same TLS alert 80. This does not support downgrading
Node as a demonstrated fix.

## Required external check

In the correct Atlas project, inspect Security > Network Access:

1. Confirm the machine's current outbound public IP is covered by an Active entry.
2. If an existing 0.0.0.0/0 entry is present, report its status; do not add one for
   this diagnosis. Its presence has not been verified here.
3. Confirm the intended cluster is running and available.

Atlas only accepts connections from permitted IPs/ranges. This is a hypothesis
to verify, not a confirmed diagnosis. See the official
[Atlas connection troubleshooting guide](https://www.mongodb.com/docs/atlas/troubleshoot-connection/).

If Atlas configuration is correct, compare the same verified-TLS probe from a
separate trusted network, accounting for that network's Atlas access-list entry.
Do not disable certificate validation, VPN/security software, or firewall rules
as a workaround.

## Reproduction

Run from backend:

    node test/atlas-diagnostic.cjs runtime
    node test/atlas-diagnostic.cjs network
    node test/atlas-diagnostic.cjs network --ipv4
    node test/atlas-diagnostic.cjs mongoose
    node test/atlas-diagnostic.cjs driver
    node test/atlas-diagnostic.cjs compare-runtimes

Allow time between connection attempts. The helper performs no document writes
and redacts credentials/connection URIs. Runtime comparison uses only the two
installed executable paths observed on this Windows machine.

Once normal startup succeeds, run:

    node test/atlas-diagnostic.cjs http
    npm run test:browser

The HTTP check verifies healthy/connected status and catalog counts 25/14/15.
The browser check reads the live catalog without creating customer/order records.
The opt-in readiness suite creates temporary records, so it was not run during
this read-only diagnosis. No connection recovered during these checks.

Application database code, credentials, dependency versions, TLS settings and
Atlas data were not changed. No seeding, push or deployment was performed.

**ATLAS CONNECTION STILL BLOCKED**
