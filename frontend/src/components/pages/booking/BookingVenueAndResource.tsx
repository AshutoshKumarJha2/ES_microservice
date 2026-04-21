import type React from "react";
import type {
  ResourceAllocationRequestDto,
  ResourceListElementDto,
  ResourceResponseDto,
} from "../../../types/venue";
import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Spinner, Table } from "react-bootstrap";
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
    <Card className="es-card border shadow-sm">
      <Card.Body className="p-3">
        <PanelHeader title="Venue & Resource Request" />

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: 'var(--blue)' }} />
          </div>
        )}

        {!loading && error && (
          <Alert variant="danger" className="py-2 mb-3">{error}</Alert>
        )}

        {!loading && success && (
          <Alert variant="success" className="py-2 mb-3">{success}</Alert>
        )}

        {!loading && !error && resources.length === 0 && (
          <p className="text-center py-5 mb-0" style={{ color: 'var(--text-muted)' }}>
            No resources available for this venue.
          </p>
        )}

        {!loading && resources.length > 0 && (
          <>
            <div
              className="text-uppercase fw-bold mb-3"
              style={{ fontSize: '0.7rem', letterSpacing: '.08em', color: 'var(--text-secondary)' }}
            >
              Select Resources
            </div>

            <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
              <thead style={{ background: 'var(--bg-subtle)' }}>
                <tr>
                  {['', 'Resource', 'Type', 'Availability', 'Units', 'Cost / Unit', 'Quantity'].map((h, i) => (
                    <th
                      key={i}
                      className="fw-semibold border-0 pb-2 px-3 pt-3"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resources.map((r) => {
                  const checked = r.resourceId in selected;
                  const unavailable = r.availability !== 'AVAILABLE';
                  return (
                    <tr key={r.resourceId} style={{ opacity: unavailable ? 0.5 : 1 }}>
                      <td className="align-middle px-3">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={checked}
                          onChange={() => toggleResource(r.resourceId)}
                          disabled={unavailable}
                        />
                      </td>
                      <td className="align-middle fw-semibold px-3" style={{ color: 'var(--text-primary)' }}>
                        {r.name}
                      </td>
                      <td className="align-middle px-3">
                        <Badge bg={r.type === 'EQUIPMENT' ? 'primary' : 'secondary'} className="fw-normal">
                          {r.type.charAt(0) + r.type.slice(1).toLowerCase()}
                        </Badge>
                      </td>
                      <td className="align-middle px-3">
                        <Badge
                          bg={
                            r.availability === 'AVAILABLE'
                              ? 'success'
                              : r.availability === 'IN_USE'
                              ? 'warning'
                              : 'secondary'
                          }
                          text={r.availability === 'IN_USE' ? 'dark' : undefined}
                          className="fw-normal"
                        >
                          {r.availability === 'IN_USE' ? 'In Use' : r.availability.charAt(0) + r.availability.slice(1).toLowerCase()}
                        </Badge>
                      </td>
                      <td className="align-middle px-3" style={{ color: 'var(--text-secondary)' }}>
                        {r.unit}
                      </td>
                      <td className="align-middle px-3" style={{ color: 'var(--text-secondary)' }}>
                        ₹{Number(r.costRate).toFixed(2)}/unit
                      </td>
                      <td className="align-middle px-3">
                        {checked ? (
                          <input
                            type="number"
                            min={1}
                            max={r.unit}
                            value={selected[r.resourceId]}
                            onChange={(e) => setQuantity(r.resourceId, Number(e.target.value))}
                            className="es-form-control form-control form-control-sm rounded-3"
                            style={{ width: '5rem' }}
                          />
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            <div className="d-flex gap-2 mt-3 px-3 pb-1">
              <Button
                variant="primary"
                size="sm"
                className="fw-semibold rounded-3"
                onClick={handleSubmit}
                disabled={submitting || Object.keys(selected).length === 0}
              >
                {submitting ? (
                  <><Spinner animation="border" size="sm" className="me-1" />Submitting…</>
                ) : (
                  'Submit Booking & Allocation'
                )}
              </Button>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default BookingVenueAndResource;
