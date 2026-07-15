import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, ImageOff } from 'lucide-react';

import { vehiclesApi, uploadsApi, ApiError } from '../../api';

const TRANSMISSIONS = ['Automatic', 'Manual'];
const FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid'];
const STATUSES = ['Available', 'Booked', 'Maintenance', 'Unlisted'];
const VEHICLE_TYPES = ['Sedan', 'SUV', 'Pickup', 'Van', 'Hatchback', 'MPV'];

const EMPTY = {
  brand: '',
  model: '',
  vehicleType: 'Sedan',
  year: '',
  color: '',
  plateNumber: '',
  transmission: 'Automatic',
  fuelType: 'Gasoline',
  seats: '',
  dailyRate: '',
  description: '',
  status: 'Available',
};

const field =
  'w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
const labelCls = 'mb-1.5 block text-sm font-medium text-gray-700';

const VehicleForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  // Load existing vehicle when editing.
  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    vehiclesApi
      .getOne(id)
      .then((data) => {
        if (!active) return;
        setForm({
          brand: data.brand ?? '',
          model: data.model ?? '',
          vehicleType: data.vehicleType ?? 'Sedan',
          year: data.year ?? '',
          color: data.color ?? '',
          plateNumber: data.plateNumber ?? '',
          transmission: data.transmission ?? 'Automatic',
          fuelType: data.fuelType ?? 'Gasoline',
          seats: data.seats ?? '',
          dailyRate: data.dailyRate ?? '',
          description: data.description ?? '',
          status: data.status ?? 'Available',
        });
        if (data.image) setPreview(data.image);
      })
      .catch(
        (err) =>
          active &&
          setError(err instanceof ApiError ? err.message : 'Failed to load vehicle'),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  const update = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // 1) Upload a new image only if the user picked one; otherwise the
      // existing image (already on the vehicle) is left untouched.
      let image;
      if (file) {
        const res = await uploadsApi.image(file);
        image = res.url;
      }

      // 2) Build payload. Numbers must be sent as numbers for validation.
      const payload = {
        brand: form.brand.trim(),
        model: form.model.trim(),
        vehicleType: form.vehicleType,
        year: Number(form.year),
        color: form.color.trim(),
        plateNumber: form.plateNumber.trim(),
        transmission: form.transmission,
        fuelType: form.fuelType,
        seats: Number(form.seats),
        dailyRate: Number(form.dailyRate),
        // Entity requires description (not-null); send empty string if blank.
        description: form.description.trim(),
        status: form.status,
      };
      if (image) payload.image = image;

      if (isEdit) {
        await vehiclesApi.update(id, payload);
      } else {
        await vehiclesApi.create(payload);
      }
      navigate('/admin/vehicles');
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : `Failed to ${isEdit ? 'update' : 'add'} vehicle`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="px-6 py-8 text-sm text-gray-500">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        to="/admin/vehicles"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Back to vehicles
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
        {isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {isEdit
          ? 'Update the details below and save your changes.'
          : 'Fill in the details. It will appear in the Browse Fleet once saved.'}
      </p>

      {error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {/* Image uploader */}
        <div>
          <label className={labelCls}>Vehicle image</label>
          <div className="flex items-center gap-4">
            <div className="flex h-28 w-40 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
              {preview ? (
                <img src={preview} alt="Preview" className="h-full w-full object-contain" />
              ) : (
                <ImageOff size={28} className="text-gray-300" />
              )}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Upload size={16} />
              {file ? 'Change image' : preview ? 'Replace image' : 'Upload image'}
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="mt-1.5 text-xs text-gray-400">JPG, PNG, WEBP or GIF up to 5MB.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="brand">Brand</label>
            <input id="brand" required value={form.brand} onChange={update('brand')} placeholder="Toyota" className={field} />
          </div>
          <div>
            <label className={labelCls} htmlFor="model">Model</label>
            <input id="model" required value={form.model} onChange={update('model')} placeholder="Vios" className={field} />
          </div>
          <div>
            <label className={labelCls} htmlFor="vehicleType">Vehicle type</label>
            <select id="vehicleType" value={form.vehicleType} onChange={update('vehicleType')} className={field}>
              {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="year">Year</label>
            <input id="year" type="number" required min="1900" max="2100" value={form.year} onChange={update('year')} placeholder="2023" className={field} />
          </div>
          <div>
            <label className={labelCls} htmlFor="color">Color</label>
            <input id="color" required value={form.color} onChange={update('color')} placeholder="White" className={field} />
          </div>
          <div>
            <label className={labelCls} htmlFor="plateNumber">Plate number</label>
            <input id="plateNumber" required value={form.plateNumber} onChange={update('plateNumber')} placeholder="ABC-1234" className={field} />
          </div>
          <div>
            <label className={labelCls} htmlFor="seats">Seats</label>
            <input id="seats" type="number" required min="1" max="50" value={form.seats} onChange={update('seats')} placeholder="5" className={field} />
          </div>
          <div>
            <label className={labelCls} htmlFor="transmission">Transmission</label>
            <select id="transmission" value={form.transmission} onChange={update('transmission')} className={field}>
              {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="fuelType">Fuel type</label>
            <select id="fuelType" value={form.fuelType} onChange={update('fuelType')} className={field}>
              {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="dailyRate">Daily rate (₱)</label>
            <input id="dailyRate" type="number" required min="0" step="0.01" value={form.dailyRate} onChange={update('dailyRate')} placeholder="1200" className={field} />
          </div>
          <div>
            <label className={labelCls} htmlFor="status">Status</label>
            <select id="status" value={form.status} onChange={update('status')} className={field}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="description">Description</label>
          <textarea id="description" rows={3} value={form.description} onChange={update('description')} placeholder="Short description of the vehicle…" className={field} />
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/admin/vehicles" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;