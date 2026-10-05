import React, { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import api from '../api.js';

const CATEGORIES = ['Religious', 'Nature', 'Heritage', 'Cultural', 'Recreational'];

const emptyForm = {
  name: '', category: 'Religious', description: '', opening_times: '',
  travel_tips: '', distance_km: '', latitude: '', longitude: '', is_verified: false,
  image_url: ''
};

export default function PlaceForm({ initial, onSubmit, onCancel, submitLabel = 'Save place' }) {
  const [form, setForm] = useState(initial ? { ...emptyForm, ...initial } : emptyForm);
  const [error, setError] = useState(null);
  // One error message per field, shown right under that field instead of
  // only a single generic banner at the top of the form.
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const isEditing = Boolean(initial?.place_id);

  useEffect(() => {
    if (isEditing) {
      api.get(`/places/${initial.place_id}/photos`)
        .then((res) => setGalleryPhotos(res.data))
        .catch(() => {});
    }
  }, [isEditing, initial?.place_id]);

  async function handleGalleryUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingGallery(true);
    try {
      const data = new FormData();
      data.append('photo', file);
      const uploadRes = await api.post('/upload', data);
      const addRes = await api.post(`/places/${initial.place_id}/photos`, { url: uploadRes.data.url });
      setGalleryPhotos((prev) => [...prev, addRes.data]);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not add that gallery photo.');
    } finally {
      setUploadingGallery(false);
      e.target.value = '';
    }
  }

  async function handleGalleryRemove(photoId) {
    try {
      await api.delete(`/places/${initial.place_id}/photos/${photoId}`);
      setGalleryPhotos((prev) => prev.filter((p) => p.photo_id !== photoId));
    } catch (err) {
      setError('Could not remove that photo.');
    }
  }

  // update() also clears that one field's error as soon as the person
  // starts fixing it, instead of leaving a stale red message on screen.
  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const data = new FormData();
      data.append('photo', file);
      const res = await api.post('/upload', data);
      update('image_url', res.data.url);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not upload that photo. Try a JPG/PNG under 5MB.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  // Returns a { fieldName: 'message' } object instead of a single string,
  // so each field can show its own message.
  function validate() {
    const errors = {};

    if (!form.name?.trim()) {
      errors.name = 'Place name is required.';
    }
    if (!form.category) {
      errors.category = 'Category is required.';
    }
    if (!form.description?.trim()) {
      errors.description = 'Description is required.';
    }
    if (form.distance_km === '' || isNaN(Number(form.distance_km)) || Number(form.distance_km) < 0) {
      errors.distance_km = 'Distance must be a positive number.';
    }
    if (form.latitude === '' || isNaN(Number(form.latitude))) {
      errors.latitude = 'A valid latitude is required.';
    }
    if (form.longitude === '' || isNaN(Number(form.longitude))) {
      errors.longitude = 'A valid longitude is required.';
    }

    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError('Please fix the fields highlighted below.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await onSubmit({ ...form, distance_km: Number(form.distance_km), latitude: Number(form.latitude), longitude: Number(form.longitude) });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save this place.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid" noValidate>
      {error && <div className="error-banner">{error}</div>}
      <div className="field">
        <label htmlFor="name">Place name</label>
        <input
          id="name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className={fieldErrors.name ? 'input-error' : ''}
        />
        {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            className={fieldErrors.category ? 'input-error' : ''}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {fieldErrors.category && <span className="field-error">{fieldErrors.category}</span>}
        </div>
        <div className="field">
          <label htmlFor="distance">Distance from Bokundara (km)</label>
          <input
            id="distance"
            type="number"
            step="0.1"
            min="0"
            value={form.distance_km}
            onChange={(e) => update('distance_km', e.target.value)}
            className={fieldErrors.distance_km ? 'input-error' : ''}
          />
          {fieldErrors.distance_km && <span className="field-error">{fieldErrors.distance_km}</span>}
        </div>
      </div>
      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          className={fieldErrors.description ? 'input-error' : ''}
        />
        {fieldErrors.description && <span className="field-error">{fieldErrors.description}</span>}
      </div>
      <div className="field">
        <label htmlFor="opening_times">Opening times</label>
        <input id="opening_times" value={form.opening_times} onChange={(e) => update('opening_times', e.target.value)} placeholder="e.g. 8:00 AM - 6:00 PM daily" />
      </div>
      <div className="field">
        <label htmlFor="travel_tips">Travel tips</label>
        <textarea id="travel_tips" value={form.travel_tips} onChange={(e) => update('travel_tips', e.target.value)} />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="latitude">Latitude</label>
          <input
            id="latitude"
            type="number"
            step="any"
            value={form.latitude}
            onChange={(e) => update('latitude', e.target.value)}
            className={fieldErrors.latitude ? 'input-error' : ''}
          />
          {fieldErrors.latitude && <span className="field-error">{fieldErrors.latitude}</span>}
        </div>
        <div className="field">
          <label htmlFor="longitude">Longitude</label>
          <input
            id="longitude"
            type="number"
            step="any"
            value={form.longitude}
            onChange={(e) => update('longitude', e.target.value)}
            className={fieldErrors.longitude ? 'input-error' : ''}
          />
          {fieldErrors.longitude && <span className="field-error">{fieldErrors.longitude}</span>}
        </div>
      </div>
      <div className="field">
        <label htmlFor="photo-upload">Photo</label>
        <div className="photo-upload-row">
          {form.image_url && <img src={form.image_url} alt="Selected place" className="photo-preview" />}
          <div>
            <input id="photo-upload" type="file" accept="image/png, image/jpeg, image/webp, image/gif" onChange={handlePhotoUpload} disabled={uploading} />
            {uploading && <p className="field-hint">Uploading…</p>}
            <p className="field-hint">Choose a photo from your computer (JPG/PNG/WEBP, up to 5MB). Leave empty to use a themed illustration instead.</p>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="field">
          <label>Photo gallery (extra photos)</label>
          <div className="gallery-manager">
            {galleryPhotos.map((p) => (
              <div key={p.photo_id} className="gallery-manager-item">
                <img src={p.url} alt="Gallery" />
                <button type="button" className="gallery-manager-remove" onClick={() => handleGalleryRemove(p.photo_id)} aria-label="Remove photo"><Icon name="x" size={14} /></button>
              </div>
            ))}
          </div>
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={handleGalleryUpload}
            disabled={uploadingGallery}
            style={{ marginTop: '0.5rem' }}
          />
          {uploadingGallery && <p className="field-hint">Uploading…</p>}
          <p className="field-hint">Add extra photos shown in the visitor-facing photo gallery (separate from the main card photo above).</p>
        </div>
      )}

      <div className="checkbox-field">
        <input id="is_verified" type="checkbox" checked={Boolean(form.is_verified)} onChange={(e) => update('is_verified', e.target.checked)} />
        <label htmlFor="is_verified" style={{ margin: 0 }}>Distance / details have been field-verified</label>
      </div>
      <div style={{ display: 'flex', gap: '0.6rem' }}>
        <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? 'Saving…' : submitLabel}</button>
        {onCancel && <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}