import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Car,
  KeyRound,
  User,
  Check,
  MapPin,
  Building2,
  Upload,
  FileText,
  Info,
  Loader2,
  X,
} from 'lucide-react';

import { vehiclesApi, bookingsApi, uploadsApi, ApiError } from '../../api';

const WITH_DRIVER_FEE = 1000;
const DRIVE_TYPES = { self: 'Self Drive', driver: 'With Driver' };

// Any valid government ID is accepted — except a Student ID.
const ID_TYPES = [
  'Passport',
  "Driver's License",
  'National ID (PhilSys)',
  'UMID',
  'SSS ID',
  'PhilHealth ID',
  'Postal ID',
  "Voter's ID",
  'PRC ID',
  'TIN ID',
  'Senior Citizen ID',
];

const PAYMENT_METHODS = ['GCash', 'Maya', 'Bank Transfer', 'Cash'];

// Philippine driver's license format, e.g. N02-12-345678.
const LICENSE_REGEX = /^[A-Za-z]\d{2}-\d{2}-\d{6}$/;

const STEPS = [
  { n: 1, label: 'Rental option' },
  { n: 2, label: 'Schedule' },
  { n: 3, label: 'Requirements' },
  { n: 4, label: 'Payment' },
];

const REQUIREMENTS = {
  self: [
    '1 Valid ID (Student ID not accepted)',
    "Driver's License (number + photo)",
    '50% Down Payment to reserve; full payment upon unit release',
  ],
  driver: [
    '1 Valid ID (Student ID not accepted)',
    'A professional, licensed driver is assigned to your trip',
    '50% Down Payment to reserve; balance & fuel/toll settled on release',
  ],
};

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100';

// Blue instruction/notes callout for clarity on each step.
const Instruction = ({ children }) => (
  <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-800">
    <Info size={15} className="mt-0.5 flex-shrink-0 text-blue-600" />
    <div>{children}</div>
  </div>
);

// Upload a single document (image or PDF) and report its stored URL.
const DocUpload = ({ label, value, onChange, onBusy }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  const isImage = value && /\.(jpg|jpeg|png|webp|gif)$/i.test(value);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr('');
    setUploading(true);
    onBusy(1);
    try {
      const { url } = await uploadsApi.document(file);
      onChange(url);
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      onBusy(-1);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-gray-700">{label}</p>
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50/60 p-2.5">
          {isImage ? (
            <img src={value} alt={label} className="h-12 w-16 rounded object-cover" />
          ) : (
            <FileText size={22} className="text-green-600" />
          )}
          <span className="flex flex-1 items-center gap-1.5 text-sm font-medium text-green-700">
            <Check size={15} /> Uploaded
          </span>
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            View
          </a>
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-gray-400 hover:text-red-600"
            aria-label="Remove"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50/60 px-3 py-4 text-sm font-medium text-gray-600 transition hover:border-blue-400 hover:bg-blue-50/40 disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Uploading…
            </>
          ) : (
            <>
              <Upload size={16} /> Upload photo or PDF
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFile}
        className="hidden"
      />
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
};

// Client-only step-by-step booking wizard.
const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDrive = searchParams.get('drive') === 'driver' ? 'driver' : 'self';

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const onBusy = (delta) => setUploadCount((c) => Math.max(0, c + delta));

  // Form state
  const [driveType, setDriveType] = useState(initialDrive);
  const [handover, setHandover] = useState('Pickup');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [location, setLocation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [idType, setIdType] = useState('');
  const [idImage, setIdImage] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseImage, setLicenseImage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [downpaymentProof, setDownpaymentProof] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let active = true;
    vehiclesApi
      .getOne(id)
      .then((data) => active && setVehicle(data))
      .catch(
        (err) =>
          active &&
          setLoadError(
            err instanceof ApiError ? err.message : 'Failed to load vehicle',
          ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const diff = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24),
    );
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  const base = vehicle ? Number(vehicle.dailyRate) : 0;
  const driverFee = driveType === 'driver' ? WITH_DRIVER_FEE : 0;
  const perDay = base + driverFee;
  const total = days * perDay;
  const downpayment = Math.round((total / 2) * 100) / 100;
  const isSelf = driveType === 'self';

  // Returns an error string for a step, or '' if valid.
  const validateStep = (s) => {
    if (s === 2) {
      if (!startDate || !endDate) return 'Please choose both a start and end date.';
      if (days <= 0) return 'The end date must be after the start date.';
      if (!contactPhone.trim()) return 'Please provide a contact number.';
      if (handover === 'Delivery' && !location.trim())
        return 'Please enter the delivery address for "Drop the car to me".';
    }
    if (s === 3) {
      if (!idType) return 'Please select the type of valid ID.';
      if (!idImage) return 'Please upload a photo of your valid ID.';
      if (isSelf) {
        if (!LICENSE_REGEX.test(licenseNumber.trim()))
          return "Enter a valid driver's license number, e.g. N02-12-345678.";
        if (!licenseImage) return "Please upload a photo of your driver's license.";
      }
    }
    if (s === 4) {
      if (!paymentMethod) return 'Please select a payment method.';
      if (!downpaymentProof)
        return 'Please upload your 50% down-payment receipt.';
    }
    return '';
  };

  const next = () => {
    const msg = validateStep(step);
    if (msg) return setError(msg);
    setError('');
    setStep((s) => Math.min(STEPS.length, s + 1));
  };

  const back = () => {
    setError('');
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    // Re-validate all steps; jump to the first that fails.
    for (const s of [2, 3, 4]) {
      const msg = validateStep(s);
      if (msg) {
        setStep(s);
        return setError(msg);
      }
    }
    setError('');
    setSubmitting(true);
    try {
      await bookingsApi.create({
        vehicleId: Number(id),
        startDate,
        endDate,
        driveType: DRIVE_TYPES[driveType],
        handover,
        location: location.trim() || undefined,
        pickupTime: pickupTime || undefined,
        contactPhone: contactPhone.trim(),
        idType,
        idImage,
        licenseNumber: isSelf ? licenseNumber.trim() : undefined,
        licenseImage: isSelf ? licenseImage : undefined,
        paymentMethod,
        downpaymentProof,
        notes: notes.trim() || undefined,
      });
      navigate('/client/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create the booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="px-6 py-8 text-sm text-gray-500">Loading…</p>;
  if (loadError) return <p className="px-6 py-8 text-sm text-red-600">{loadError}</p>;
  if (!vehicle) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Link
        to={`/vehicles/${vehicle.id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Back to vehicle
      </Link>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {/* Vehicle summary */}
        <div className="flex items-center gap-4 border-b border-gray-100 p-5">
          <div className="flex h-16 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
            {vehicle.image ? (
              <img src={vehicle.image} alt={vehicle.model} className="h-full w-full object-contain" />
            ) : (
              <Car size={28} className="text-gray-300" />
            )}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {vehicle.year} {vehicle.brand} {vehicle.model}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">₱{base.toLocaleString()} / day</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          {STEPS.map((st, i) => {
            const done = step > st.n;
            const activeStep = step === st.n;
            return (
              <div key={st.n} className="flex flex-1 items-center gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      done
                        ? 'bg-green-600 text-white'
                        : activeStep
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {done ? <Check size={14} /> : st.n}
                  </span>
                  <span
                    className={`hidden text-xs font-medium sm:inline ${
                      activeStep ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span className={`h-px flex-1 ${done ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-5 p-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* STEP 1 — rental option */}
          {step === 1 && (
            <>
              <h2 className="text-sm font-semibold text-gray-900">Step 1 · Choose your rental option</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDriveType('self')}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    driveType === 'self'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600/20'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <KeyRound size={16} /> Self Drive
                </button>
                <button
                  type="button"
                  onClick={() => setDriveType('driver')}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    driveType === 'driver'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600/20'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User size={16} /> With Driver
                </button>
              </div>

              <ul className="space-y-1.5 rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                <li className="mb-1 text-xs font-medium text-gray-500">What you’ll need:</li>
                {REQUIREMENTS[driveType].map((req) => (
                  <li key={req} className="flex items-start gap-2 text-xs text-gray-600">
                    <Check size={13} className="mt-0.5 flex-shrink-0 text-green-600" />
                    {req}
                  </li>
                ))}
              </ul>

              <Instruction>
                Prepare a clear photo of your valid ID
                {isSelf ? " and driver's license" : ''}, plus your 50% down-payment
                receipt. You’ll upload them in the next steps.
              </Instruction>
            </>
          )}

          {/* STEP 2 — schedule & handover */}
          {step === 2 && (
            <>
              <h2 className="text-sm font-semibold text-gray-900">Step 2 · Schedule & handover</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="startDate" className="mb-1.5 block text-sm font-medium text-gray-700">Start date</label>
                  <input id="startDate" type="date" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="endDate" className="mb-1.5 block text-sm font-medium text-gray-700">End date</label>
                  <input id="endDate" type="date" min={startDate || today} value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHandover('Pickup')}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    handover === 'Pickup'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600/20'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Building2 size={16} /> I’ll get the car
                </button>
                <button
                  type="button"
                  onClick={() => setHandover('Delivery')}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    handover === 'Delivery'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600/20'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MapPin size={16} /> Drop the car to me
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-gray-700">
                    {handover === 'Delivery' ? 'Delivery address' : 'Pickup point'}
                    {handover === 'Delivery' && <span className="text-red-600"> *</span>}
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={handover === 'Delivery' ? 'Where should we deliver the car?' : 'e.g. AllDrive office, Butuan City'}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="pickupTime" className="mb-1.5 block text-sm font-medium text-gray-700">Preferred time</label>
                  <input id="pickupTime" type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="contactPhone" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Contact number <span className="text-red-600">*</span>
                  </label>
                  <input id="contactPhone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="09XX XXX XXXX" className={inputCls} />
                </div>
              </div>

              <Instruction>
                Choose <b>“I’ll get the car”</b> to pick it up at our office, or{' '}
                <b>“Drop the car to me”</b> to have it delivered to your address
                (delivery may incur a fee based on distance).
              </Instruction>
            </>
          )}

          {/* STEP 3 — requirements / documents */}
          {step === 3 && (
            <>
              <h2 className="text-sm font-semibold text-gray-900">Step 3 · Requirements & documents</h2>

              <div>
                <label htmlFor="idType" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Type of valid ID <span className="text-red-600">*</span>
                </label>
                <select id="idType" value={idType} onChange={(e) => setIdType(e.target.value)} className={inputCls}>
                  <option value="">Select a valid ID…</option>
                  {ID_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-400">Student IDs are not accepted.</p>
              </div>

              <DocUpload label="Upload your valid ID *" value={idImage} onChange={setIdImage} onBusy={onBusy} />

              {isSelf && (
                <>
                  <div>
                    <label htmlFor="licenseNumber" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Driver’s license number <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="licenseNumber"
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                      placeholder="N02-12-345678"
                      className={inputCls}
                    />
                    <p className="mt-1 text-xs text-gray-400">Format: 1 letter, then 2-2-6 digits (e.g. N02-12-345678).</p>
                  </div>
                  <DocUpload label="Upload your driver's license *" value={licenseImage} onChange={setLicenseImage} onBusy={onBusy} />
                </>
              )}

              <Instruction>
                Make sure the details on your uploaded documents are readable and not
                cut off. {isSelf ? "The license name must match the valid ID." : 'Your assigned driver handles the driving for With Driver bookings.'}
              </Instruction>
            </>
          )}

          {/* STEP 4 — payment & review */}
          {step === 4 && (
            <>
              <h2 className="text-sm font-semibold text-gray-900">Step 4 · Payment</h2>

              {/* Price summary */}
              <div className="rounded-xl bg-gray-50 p-4 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <span>{days} {days === 1 ? 'day' : 'days'} × ₱{base.toLocaleString()}</span>
                  <span>₱{(days * base).toLocaleString()}</span>
                </div>
                {driverFee > 0 && (
                  <div className="mt-1 flex items-center justify-between text-gray-600">
                    <span>Driver’s fee · {days} × ₱{driverFee.toLocaleString()}</span>
                    <span>₱{(days * driverFee).toLocaleString()}</span>
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2">
                  <span className="font-semibold text-gray-900">Estimated total</span>
                  <span className="font-bold text-gray-900">₱{total.toLocaleString()}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-semibold text-blue-700">50% down-payment now</span>
                  <span className="text-lg font-bold text-blue-700">₱{downpayment.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label htmlFor="paymentMethod" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Payment method <span className="text-red-600">*</span>
                </label>
                <select id="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputCls}>
                  <option value="">Select a payment method…</option>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <DocUpload
                label="Upload 50% down-payment receipt *"
                value={downpaymentProof}
                onChange={setDownpaymentProof}
                onBusy={onBusy}
              />

              <div>
                <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Notes <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything we should know about your trip?" className={inputCls} />
              </div>

              <Instruction>
                Send your <b>₱{downpayment.toLocaleString()}</b> down-payment via your
                chosen method, then upload the receipt/screenshot above. Your request
                stays <b>Pending</b> until our team confirms your payment.
              </Instruction>
            </>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={back}
              disabled={step === 1}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft size={16} /> Back
            </button>

            {step < STEPS.length ? (
              <button
                type="button"
                onClick={next}
                disabled={uploadCount > 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || uploadCount > 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit booking request'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
