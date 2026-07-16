import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  X,
  Undo2,
  CheckCheck,
  Car,
  FileText,
  ShieldCheck,
  Eye,
  Info,
} from 'lucide-react';

import { bookingsApi, ApiError } from '../../api';
import Pagination from '../../components/Pagination';

const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-700',
  Approved: 'bg-blue-50 text-blue-700',
  Returned: 'bg-purple-50 text-purple-700',
  Completed: 'bg-green-50 text-green-700',
  Declined: 'bg-red-50 text-red-700',
  Cancelled: 'bg-gray-100 text-gray-500',
};

const PAYMENT_STATUS_STYLES = {
  Unpaid: 'bg-gray-100 text-gray-500',
  'Down Payment': 'bg-amber-50 text-amber-700',
  'Fully Paid': 'bg-green-50 text-green-700',
};

const PAYMENT_STATUSES = ['Unpaid', 'Down Payment', 'Fully Paid'];

const STATUS_TABS = [
  'All',
  'Pending',
  'Approved',
  'Returned',
  'Completed',
  'Declined',
  'Cancelled',
];

// Which status actions are offered for each current status.
const ACTIONS = {
  Pending: [
    { label: 'Approve', to: 'Approved', icon: Check, cls: 'bg-blue-600 hover:bg-blue-700 text-white' },
    { label: 'Decline', to: 'Declined', icon: X, cls: 'border border-red-300 text-red-600 hover:bg-red-50' },
  ],
  Approved: [
    { label: 'Mark returned', to: 'Returned', icon: Undo2, cls: 'border border-purple-300 text-purple-600 hover:bg-purple-50' },
    { label: 'Complete', to: 'Completed', icon: CheckCheck, cls: 'bg-green-600 hover:bg-green-700 text-white' },
  ],
  Returned: [
    { label: 'Complete', to: 'Completed', icon: CheckCheck, cls: 'bg-green-600 hover:bg-green-700 text-white' },
  ],
  Declined: [],
  Completed: [],
  Cancelled: [],
};

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('All');
  const [busyId, setBusyId] = useState(null);
  const [reviewing, setReviewing] = useState(null); // booking being validated
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    bookingsApi
      .listAll()
      .then((data) => active && setBookings(Array.isArray(data) ? data : []))
      .catch(
        (err) =>
          active &&
          setError(err instanceof ApiError ? err.message : 'Failed to load bookings'),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    const c = { All: bookings.length };
    for (const b of bookings) c[b.status] = (c[b.status] || 0) + 1;
    return c;
  }, [bookings]);

  const visible = useMemo(
    () => (tab === 'All' ? bookings : bookings.filter((b) => b.status === tab)),
    [bookings, tab],
  );

  // Paginate the current tab's bookings.
  const totalPages = Math.max(1, Math.ceil(visible.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paged = visible.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const selectTab = (t) => {
    setTab(t);
    setPage(1);
  };

  const handlePerPage = (n) => {
    setPerPage(n);
    setPage(1);
  };

  const applyStatus = async (booking, status) => {
    setBusyId(booking.id);
    try {
      const updated = await bookingsApi.updateStatus(booking.id, status);
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? updated : b)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to update status');
    } finally {
      setBusyId(null);
    }
  };

  const handleSaved = (updated) => {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setReviewing(null);
  };

  return (
    <div className="mx-auto max-w-10xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Bookings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review requests, approve or decline, manage handover, and track returns.
        </p>
      </div>

      {/* Status tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => selectTab(t)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              tab === t
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t}
            {counts[t] ? (
              <span className={tab === t ? 'text-gray-300' : 'text-gray-400'}>
                {' '}· {counts[t]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : visible.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white px-5 py-10 text-center text-sm text-gray-500">
          No bookings in this view.
        </p>
      ) : (
        <div className="space-y-4">
          {paged.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-gray-200 bg-white p-5"
            >
              {/* Top: vehicle name + info icon */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                    {b.vehicle?.image ? (
                      <img
                        src={b.vehicle.image}
                        alt={b.vehicle.model}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Car size={20} className="text-gray-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">
                      {b.vehicle
                        ? `${b.vehicle.year} ${b.vehicle.brand} ${b.vehicle.model}`
                        : `Vehicle #${b.vehicleId}`}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      {b.client?.name || `Client #${b.clientId}`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setReviewing(b)}
                  title="View booking info"
                  aria-label="View booking info"
                  className="flex-shrink-0 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-blue-600"
                >
                  <Info size={18} />
                </button>
              </div>

              {/* Status chips */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    STATUS_STYLES[b.status] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {b.status}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    PAYMENT_STATUS_STYLES[b.paymentStatus] ?? 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {b.paymentStatus || 'Unpaid'}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    b.documentsVerified
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {b.documentsVerified ? (
                    <>
                      <ShieldCheck size={12} /> Verified
                    </>
                  ) : (
                    'Not verified'
                  )}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 sm:flex sm:flex-wrap">
                <button
                  onClick={() => setReviewing(b)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-300 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                >
                  <Eye size={14} />
                  Review &amp; validate
                </button>
                

                {(ACTIONS[b.status] ?? []).map((a) => {
                  // Approval is blocked until the admin validates the documents.
                  const blocked = a.to === 'Approved' && !b.documentsVerified;
                  return (
                    <button
                      key={a.to}
                      disabled={busyId === b.id || blocked}
                      onClick={() => applyStatus(b, a.to)}
                      title={
                        blocked ? 'Validate the documents before approving' : undefined
                      }
                      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${a.cls}`}
                    >
                      <a.icon size={14} />
                      {a.label}
                    </button>
                  );
                })}
              </div>

              {b.status === 'Pending' && !b.documentsVerified && (
                <p className="mt-2 text-xs text-gray-400">
                  Validate documents (Review &amp; validate) to enable approval.
                </p>
              )}
            </div>
          ))}

          <div className="rounded-2xl border border-gray-200 bg-white">
            <Pagination
              page={currentPage}
              perPage={perPage}
              totalItems={visible.length}
              onPageChange={setPage}
              onPerPageChange={handlePerPage}
            />
          </div>
        </div>
      )}

      {reviewing && (
        <ReviewBookingModal
          booking={reviewing}
          onClose={() => setReviewing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

const Detail = ({ label, value, className = '' }) => (
  <div className={className}>
    <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
    <p className="mt-0.5 font-medium text-gray-900">{value}</p>
  </div>
);

// --- Review & validate modal: full client submission + validation controls ---
const isImageUrl = (url) => url && /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

const DocPreview = ({ url, label, onView }) => {
  if (!url) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-3 text-center text-xs text-gray-400">
        {label}: not provided
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-gray-200 p-2">
      <p className="mb-1.5 text-xs font-medium text-gray-500">{label}</p>
      {isImageUrl(url) ? (
        <button
          type="button"
          onClick={() => onView({ url, label, isImage: true })}
          className="block w-full"
        >
          <img
            src={url}
            alt={label}
            className="h-32 w-full rounded object-cover transition hover:opacity-90"
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onView({ url, label, isImage: false })}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <FileText size={15} /> View document
        </button>
      )}
    </div>
  );
};

// Full-screen viewer for a document (image or PDF), shown over the modal.
const DocLightbox = ({ doc, onClose }) => {
  if (!doc) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
      >
        <X size={22} />
      </button>
      <div
        className="max-h-[90vh] w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-2 text-center text-sm font-medium text-white/80">
          {doc.label}
        </p>
        {doc.isImage ? (
          <img
            src={doc.url}
            alt={doc.label}
            className="mx-auto max-h-[80vh] w-auto rounded-lg object-contain"
          />
        ) : (
          <iframe
            src={doc.url}
            title={doc.label}
            className="h-[80vh] w-full rounded-lg bg-white"
          />
        )}
      </div>
    </div>
  );
};

const ReviewBookingModal = ({ booking, onClose, onSaved }) => {
  const [paymentStatus, setPaymentStatus] = useState(
    booking.paymentStatus || 'Unpaid',
  );
  const [documentsVerified, setDocumentsVerified] = useState(
    !!booking.documentsVerified,
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);

  const isSelf = booking.driveType === 'Self Drive';

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const updated = await bookingsApi.update(booking.id, {
        paymentStatus,
        documentsVerified,
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Review booking #{booking.id}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Client & booking details */}
        <div className="rounded-xl border border-gray-200 p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Client submission
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <Detail label="Client" value={booking.client?.name || `#${booking.clientId}`} />
            <Detail label="Email" value={booking.client?.email || '—'} />
            <Detail label="Contact" value={booking.contactPhone || '—'} />
            <Detail
              label="Vehicle"
              value={
                booking.vehicle
                  ? `${booking.vehicle.brand} ${booking.vehicle.model}`
                  : `#${booking.vehicleId}`
              }
            />
            <Detail label="Dates" value={`${booking.startDate} → ${booking.endDate}`} />
            <Detail label="Drive type" value={booking.driveType} />
            <Detail
              label="Handover"
              value={booking.handover === 'Delivery' ? 'Drop to client' : 'Client pickup'}
            />
            <Detail label="Place" value={booking.location || '—'} />
            <Detail label="Time" value={booking.pickupTime || '—'} />
            <Detail label="ID type" value={booking.idType || '—'} />
            {isSelf && (
              <Detail label="License no." value={booking.licenseNumber || '—'} />
            )}
            <Detail label="Payment method" value={booking.paymentMethod || '—'} />
            <Detail
              label="Total"
              value={`₱${Number(booking.totalPrice).toLocaleString()}`}
            />
            <Detail
              label="Down-payment (50%)"
              value={
                booking.downpaymentAmount != null
                  ? `₱${Number(booking.downpaymentAmount).toLocaleString()}`
                  : '—'
              }
            />
          </div>
          {booking.notes && (
            <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
              <span className="font-medium text-gray-700">Notes:</span> {booking.notes}
            </p>
          )}
        </div>

        {/* Uploaded documents */}
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            Uploaded documents
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <DocPreview url={booking.idImage} label="Valid ID" onView={setViewingDoc} />
            {isSelf && (
              <DocPreview
                url={booking.licenseImage}
                label="Driver's license"
                onView={setViewingDoc}
              />
            )}
            <DocPreview
              url={booking.downpaymentProof}
              label="Payment receipt"
              onView={setViewingDoc}
            />
          </div>
        </div>

        {/* Validation controls */}
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Validation</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Payment status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className={inputCls}
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-gray-200 bg-white p-3">
              <input
                type="checkbox"
                checked={documentsVerified}
                onChange={(e) => setDocumentsVerified(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                <span className="font-medium">Documents & payment validated</span>
                <span className="block text-xs text-gray-400">
                  Required before this booking can be approved.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save validation'}
          </button>
        </div>
      </div>

      <DocLightbox doc={viewingDoc} onClose={() => setViewingDoc(null)} />
    </div>
  );
};

export default BookingManagement;
