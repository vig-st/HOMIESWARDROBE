import { motion, AnimatePresence } from 'framer-motion';

export function Modal({ open, title, onClose, children, actions }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-primary">{title}</h3>
              <button onClick={onClose} className="text-secondary">Close</button>
            </div>
            <div className="space-y-4">{children}</div>
            {actions && <div className="mt-6 flex justify-end gap-3">{actions}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
