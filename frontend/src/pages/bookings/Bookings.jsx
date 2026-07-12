import { useState, useEffect } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { Plus, X, Calendar, MapPin, Clock, Trash } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { bookingApi } from "../../api/bookingApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function Bookings() {
  const [events, setEvents] = useState([]);
  const [bookableAssets, setBookableAssets] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [activeTab, setActiveTab] = useState("calendar");
  const [isLoading, setIsLoading] = useState(true);

  // Form Booking Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");

  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      // Fetch calendar events
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString();
      const end = new Date(now.getFullYear(), now.getMonth() + 2, 1).toISOString();
      
      const eventsData = await bookingApi.getCalendarEvents(start, end);
      const formattedEvents = eventsData.map((e) => ({
        id: e.id,
        title: `${e.asset.name} - ${e.title}`,
        start: new Date(e.startTime),
        end: new Date(e.endTime),
        resourceId: e.assetId,
        user: e.user,
      }));
      setEvents(formattedEvents);

      // Fetch bookings list
      const listData = await bookingApi.listBookings();
      setBookingsList(listData.data || listData);

      // Fetch bookable assets
      const assetsData = await bookingApi.getBookableAssets();
      setBookableAssets(assetsData);
    } catch (err) {
      toast.error("Failed to load reservation data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!title || !selectedAsset || !startTime || !endTime) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      await bookingApi.createBooking({
        assetId: selectedAsset,
        title,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        description,
      });
      toast.success("Resource booked successfully!");
      setIsOpen(false);
      
      // Reset form
      setTitle("");
      setSelectedAsset("");
      setStartTime("");
      setEndTime("");
      setDescription("");

      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking conflict. Please choose another time slot.");
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingApi.cancelBooking(id, "Cancelled by employee");
      toast.success("Booking cancelled.");
      fetchBookings();
    } catch (err) {
      toast.error("Failed to cancel booking.");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header and Add Booking button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Resource Bookings</h1>
          <p className="text-sm text-slate-400">Schedule shared assets (conference rooms, vehicles, lab tools) with real-time conflict checking.</p>
        </div>

        <Button onClick={() => setIsOpen(true)} className="w-auto py-2.5 px-4 text-xs font-semibold flex items-center gap-2">
          <Plus className="h-4 w-4" /> Book Resource
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("calendar")}
          className={`py-2 px-6 font-semibold text-xs border-b-2 uppercase tracking-wider transition ${
            activeTab === "calendar" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Calendar Schedule
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`py-2 px-6 font-semibold text-xs border-b-2 uppercase tracking-wider transition ${
            activeTab === "list" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          My Reservations List
        </button>
      </div>

      {/* Tab Contents */}
      {isLoading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : activeTab === "calendar" ? (
        /* Calendar render */
        <Card className="bg-slate-900 border border-slate-800 p-6 h-[600px] text-slate-100 text-xs">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%", color: "#cbd5e1" }}
            views={["month", "week", "day"]}
            eventPropGetter={() => ({
              style: {
                backgroundColor: "#4f46e5",
                borderColor: "#6366f1",
                color: "#fff",
                borderRadius: "6px",
                fontSize: "11px",
              },
            })}
          />
        </Card>
      ) : (
        /* Reservations list render */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookingsList.length > 0 ? (
            bookingsList.map((b) => (
              <Card key={b.id} className="flex justify-between items-start">
                <div className="space-y-3">
                  <div>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                      b.bookingStatus === "UPCOMING"
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        : b.bookingStatus === "CANCELLED"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {b.bookingStatus}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{b.title}</h3>
                    <p className="text-xs text-indigo-400 font-mono mt-1 font-semibold">{b.asset.name} ({b.asset.assetTag})</p>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>{new Date(b.startTime).toLocaleString()} - {new Date(b.endTime).toLocaleTimeString()}</span>
                    </div>
                    {b.asset.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        <span>{b.asset.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {b.bookingStatus === "UPCOMING" && (
                  <Button onClick={() => handleCancelBooking(b.id)} variant="danger" className="py-2 px-3 w-auto text-xs">
                    <Trash className="h-3.5 w-3.5" />
                  </Button>
                )}
              </Card>
            ))
          ) : (
            <Card className="col-span-2 text-center py-20">
              <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-350">No Booking Found</h3>
              <p className="text-sm text-slate-500">You haven't reserved any shared resources yet.</p>
            </Card>
          )}
        </div>
      )}

      {/* Booking Form Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-100">Schedule Shared Resource</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <Input
                label="Booking Title"
                placeholder="e.g. Weekly Sync, Field visit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Resource Asset</label>
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none"
                  required
                >
                  <option value="">Select Bookable Asset</option>
                  {bookableAssets.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.assetTag}) - {a.location || "No Location"}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date Time"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
                <Input
                  label="End Date Time"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Booking Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button onClick={() => setIsOpen(false)} variant="secondary" className="w-auto px-4">Cancel</Button>
                <Button type="submit" className="w-auto px-6">Book Slot</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Bookings;
