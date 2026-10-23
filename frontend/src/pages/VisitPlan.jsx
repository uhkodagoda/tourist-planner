import React, { useEffect, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api.js';
import MapView from '../components/MapView.jsx';
import { usePlan } from '../PlanContext.jsx';
import { useToast } from '../ToastContext.jsx';
import { optimizeRoute } from '../utils/routeOptimizer.js';
import { todayString, googleCalendarUrl, buildIcs, downloadIcs } from '../utils/calendar.js';

export default function VisitPlan() {
  const { plan, removePlace, moveUp, moveDown, clearPlan, totalDistance, addPlace } = usePlan();
  const { showToast } = useToast();
  const [planName, setPlanName] = useState('My Bokundara Day Trip');
  const [plannedDate, setPlannedDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const [savedInfo, setSavedInfo] = useState(null);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const today = todayString();

  // Open a shared link such as /plan?places=3,1,7 and rebuild that plan.
  useEffect(() => {
    const ids = (searchParams.get('places') || '').split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0);
    if (ids.length === 0) return;
    api.get('/places')
      .then((res) => {
        const byId = new Map(res.data.map((p) => [p.place_id, p]));
        ids.forEach((id) => { if (byId.has(id)) addPlace(byId.get(id)); });
      })
      .catch(() => {})
      .finally(() => setSearchParams({}, { replace: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    if (plannedDate && plannedDate < today) {
      setError('Please choose today or a future date for your visit.');
      return;
    }
    const snapshot = {
      name: planName,
      date: plannedDate,
      stops: plan.map((p, i) => `${i + 1}. ${p.name} (${p.category}, ~${Number(p.distance_km).toFixed(1)} km from Bokundara)`)
    };
    setSaving(true);
    setError(null);
    setSaved(null);
    try {
      const res = await api.post('/visit-plans', {
        plan_name: planName,
        planned_date: plannedDate || null,
        place_ids: plan.map((p) => p.place_id)
      });
      setSaved(res.data);
      setSavedInfo(snapshot);
      clearPlan();
      showToast('Visit plan saved!', 'success');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save the visit plan. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleShare() {
    const planData = plan.map((p) => p.place_id).join(',');
    const url = `${window.location.origin}/plan?places=${planData}`;

    if (navigator.share) {
      navigator.share({ title: 'My Bokundara Day Trip', text: 'Check out my visit plan!', url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast('Plan link copied to clipboard!', 'success');
    }
  }

  function handleOptimize() {
    if (plan.length < 2) {
      showToast('Add at least 2 places to optimize the route.', 'error');
      return;
    }
    const optimized = optimizeRoute(plan);
    clearPlan();
    optimized.forEach((place) => addPlace(place));
    showToast('Route optimized for shortest distance!', 'success');
  }

  if (saved) {
    const info = savedInfo || { name: saved.plan_name, date: '', stops: [] };
    const details = ['Day-visit plan from Bokundara Trails', '', ...info.stops].join('\n');
    const eventTitle = info.name || 'My Bokundara Day Trip';
    return (
      <div className="empty-state">
        <h2>Plan saved!</h2>
        <p>
          &ldquo;{saved.plan_name}&rdquo; is saved with a total distance of{' '}
          <strong>{Number(saved.total_distance_km).toFixed(1)} km</strong>.
        </p>
        {info.date ? (
          <>
            <p>Planned for <strong>{new Date(`${info.date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>. Add it to your calendar so you do not forget:</p>
            <div className="calendar-actions">
              <a className="btn btn-outline" target="_blank" rel="noopener noreferrer" href={googleCalendarUrl({ title: eventTitle, date: info.date, details })}>
                Google Calendar
              </a>
              <button type="button" className="btn btn-outline" onClick={() => downloadIcs('bokundara-day-trip.ics', buildIcs({ title: eventTitle, date: info.date, details }))}>
                Download .ics file
              </button>
            </div>
            <p className="calendar-note">The .ics file works with Apple Calendar, Outlook and most phone calendars.</p>
          </>
        ) : (
          <p className="calendar-note">Choose a planned date next time to add your plan to a calendar.</p>
        )}
        <Link to="/" className="btn btn-gold">Plan another day</Link>
      </div>
    );
  }

  if (plan.length === 0) {
    return (
      <div className="empty-state">
        <h2>Your visit plan is empty</h2>
        <p>Browse places and tap &ldquo;Add to plan&rdquo; to start building a one-day itinerary.</p>
        <Link to="/" className="btn btn-gold">Explore places</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="hero" style={{ paddingBottom: '1.2rem' }}>
        <div className="eyebrow">Your itinerary</div>
        <h1>Your one-day visit plan</h1>
        <p className="lede">Reorder your stops, check the total distance, then save your plan.</p>
      </div>

      <div className="detail-grid">
        <div>
          <div className="plan-toolbar">
            <button type="button" onClick={handlePrint} className="btn btn-outline btn-sm"><Icon name="printer" size={15} className="icon-lead" />Print</button>
            <button type="button" onClick={handleShare} className="btn btn-outline btn-sm"><Icon name="link" size={15} className="icon-lead" />Share</button>
            <button type="button" onClick={handleOptimize} className="btn btn-gold btn-sm"><Icon name="route" size={15} className="icon-lead" />Optimize Route</button>
            <button type="button" onClick={clearPlan} className="btn btn-danger btn-sm"><Icon name="trash" size={15} className="icon-lead" />Clear</button>
          </div>

          <ul className="plan-list">
            {plan.map((place, index) => (
              <li key={place.place_id} className="plan-item">
                <span className="plan-order">{index + 1}</span>
                <div className="plan-item-body">
                  <h4>{place.name}</h4>
                  <span>{place.category} &middot; ~{Number(place.distance_km).toFixed(1)} km</span>
                </div>
                <div className="plan-controls">
                  <button type="button" className="icon-btn" onClick={() => moveUp(index)} disabled={index === 0} aria-label={`Move ${place.name} up`}><Icon name="arrowUp" size={16} /></button>
                  <button type="button" className="icon-btn" onClick={() => moveDown(index)} disabled={index === plan.length - 1} aria-label={`Move ${place.name} down`}><Icon name="arrowDown" size={16} /></button>
                  <button type="button" className="icon-btn" onClick={() => removePlace(place.place_id)} aria-label={`Remove ${place.name} from plan`}><Icon name="x" size={16} /></button>
                </div>
              </li>
            ))}
          </ul>

          <div className="plan-summary">
            <span>Approximate total one-way distance</span>
            <span className="total">{totalDistance.toFixed(1)} km</span>
          </div>

          {error && <div className="error-banner" style={{ marginTop: '1rem' }}>{error}</div>}

          <div className="form-card" style={{ margin: '1.6rem 0 0', maxWidth: 'none', padding: '1.3rem' }}>
            <h3 style={{ marginBottom: '0.9rem' }}>Save this plan</h3>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="plan-name">Plan name</label>
                <input id="plan-name" type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="plan-date">Planned date (optional)</label>
                <input id="plan-date" type="date" min={today} value={plannedDate} onChange={(e) => setPlannedDate(e.target.value)} />
              </div>
              <button type="button" className="btn btn-gold" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save visit plan'}
              </button>
            </div>
          </div>
        </div>

        <div>
          <MapView places={plan} height={360} title="Route for this plan" />
        </div>
      </div>
    </div>
  );
}