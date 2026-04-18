import type React from "react";
import type {
  ResourceAllocationRequestDto,
  ResourceListElementDto,
  ResourceResponseDto,
} from "../../../types/venue";
import { useEffect, useState } from "react";
import styles from '../../../css/events/EventsPanel.module.css';
import { PanelHeader } from "../../elements/events/PanelHeader";
import { eventService } from "../../../services/events/eventService";
import { resourceSource } from "../../../services/resource/resourceService";
import { bookingService } from "../../../services/booking/bookingService";

interface BookingVenueAndResourceProps {
  eventId: string;
}

const BookingVenueAndResource: React.FC<BookingVenueAndResourceProps> = ({ eventId }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [venueId, setVenueId] = useState<string>("");
  const [resources, setResources] = useState<ResourceResponseDto[]>([]);
  const [selected, setSelected] = useState<Record<string, number>>({}); // resourceId -> quantity
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    eventService
      .getById(eventId)
      .then((eve) => {
        setVenueId(eve.venueId);
        return resourceSource.getResourcesByVenue(eve.venueId);
      })
      .then(setResources)
      .catch((err) => setError(err?.message ?? "Failed to load resources."))
      .finally(() => setLoading(false));
  }, [eventId]);

  const toggleResource = (resourceId: string) => {
    setSelected((prev) => {
      if (resourceId in prev) {
        const next = { ...prev };
        delete next[resourceId];
        return next;
      }
      return { ...prev, [resourceId]: 1 };
    });
  };

  const setQuantity = (resourceId: string, qty: number) => {
    setSelected((prev) => ({ ...prev, [resourceId]: Math.max(1, qty) }));
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    const resourceListElement: ResourceListElementDto[] = Object.entries(selected).map(
      ([resourceId, quantity]) => ({ resourceId, quantity })
    );

    if (resourceListElement.length === 0) {
      setError("Please select at least one resource.");
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: Create booking for the event + venue
      const booking = await bookingService.createBooking({ eventId, venueId });

      // Step 2: Request resource allocation against that booking
      const allocationPayload: ResourceAllocationRequestDto = {
        eventId,
        venueId,
        bookingId: booking.bookingId,
        resourceListElement,
      };
      await resourceSource.requestAllocation(allocationPayload);

      setSuccess("Booking and resource allocation requests submitted successfully.");
      setSelected({});
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      <PanelHeader title="Venue & Resource Request" />

      {loading && <p className={styles.loading}>Loading resources…</p>}

      {!loading && error && <p className={styles['error-msg']}>{error}</p>}

      {!loading && success && (
        <p
          style={{
            color: 'var(--green)',
            background: 'var(--green-subtle)',
            border: '1px solid var(--green)',
            borderRadius: 8,
            padding: '0.65rem 1rem',
            fontSize: '0.88rem',
          }}
        >
          {success}
        </p>
      )}

      {!loading && !error && resources.length === 0 && (
        <p className={styles.empty}>No resources available for this venue.</p>
      )}

      {!loading && resources.length > 0 && (
        <>
          <p className={styles['section-heading']}>Select Resources</p>

          <div className={styles['table-wrapper']}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '2.5rem' }}></th>
                  <th>Resource</th>
                  <th>Type</th>
                  <th>Availability</th>
                  <th>Units</th>
                  <th>Cost / Unit</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((r) => {
                  const checked = r.resourceId in selected;
                  const unavailable = r.availability !== 'AVAILABLE';
                  return (
                    <tr key={r.resourceId} style={{ opacity: unavailable ? 0.5 : 1 }}>
                      <td>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleResource(r.resourceId)}
                          disabled={unavailable}
                          style={{ cursor: unavailable ? 'not-allowed' : 'pointer', width: 16, height: 16 }}
                        />
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            r.type === 'EQUIPMENT' ? styles['badge-draft'] : styles['badge-published']
                          }`}
                        >
                          {r.type}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            r.availability === 'AVAILABLE'
                              ? styles['badge-active']
                              : r.availability === 'IN_USE'
                              ? styles['badge-pending']
                              : styles['badge-inactive']
                          }`}
                        >
                          {r.availability}
                        </span>
                      </td>
                      <td>{r.unit}</td>
                      <td>₹{r.costRate}</td>
                      <td>
                        {checked ? (
                          <input
                            type="number"
                            min={1}
                            max={r.unit}
                            value={selected[r.resourceId]}
                            onChange={(e) => setQuantity(r.resourceId, Number(e.target.value))}
                            className={styles['form-input']}
                            style={{ width: '5rem', padding: '0.3rem 0.5rem' }}
                          />
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={styles['form-footer']}>
            <button
              className={styles['btn-submit']}
              onClick={handleSubmit}
              disabled={submitting || Object.keys(selected).length === 0}
            >
              {submitting ? "Submitting…" : "Submit Booking & Allocation"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingVenueAndResource;
