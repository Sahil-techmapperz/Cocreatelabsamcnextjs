"use client";

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import moment from 'moment-timezone';
import { FaTrash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import { checkSessionExpiration } from '@/lib/checkSessionExpiration';

const Calender = () => {
  const [events, setEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [availabilityModalIsOpen, setAvailabilityModalIsOpen] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [newAvailability, setNewAvailability] = useState([{ start: '', end: '' }]);
  const [timeZone, setTimeZone] = useState('');
  const router = useRouter();

  const GetSession = async () => {
    const url = `/api/sessions/all/bymentor`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      const res = await response.json();
      if (response.ok) {
        const formattedEvents = res.data.map(event => ({
          title: event.title,
          start: event.startTime,
          end: event.endTime,
          extendedProps: {
            description: event.description,
            sessionLink: event.sessionLink,
            status: event.status
          }
        }));
        setEvents(formattedEvents);
      } else {
        console.error('Error fetching sessions:', res.message);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const GetAvailability = async () => {
    const url = `/api/users/availability`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      const res = await response.json();
      if (response.ok) {
        setAvailability(res.availability);
        setTimeZone(res.timeZone);
      } else {
        console.error('Error fetching availability:', res.message);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };


  useEffect(() => {
    // Check session expiration on initial load
    checkSessionExpiration(router, "mentor");

    // Set up an interval to check session expiration every second
    const interval = setInterval(() => {
      checkSessionExpiration(router, "mentor");
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    GetSession();
    GetAvailability();
  }, []);

  const handleEventClick = (eventInfo) => {
    setSelectedEvent(eventInfo.event);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedEvent(null);
  };

  const closeAvailabilityModal = () => {
    setAvailabilityModalIsOpen(false);
  };

  const convertDateToReadableFormat = (isoDateString) => {
    if (!isoDateString || !timeZone) return '';
    const dateObj = moment.tz(isoDateString, timeZone);
    return dateObj.format('h:mm:ss a');
  };

  const convertDateToReadableFormat2 = (isoDateString, timeZone) => {
    if (!isoDateString || !timeZone) return '';
    const dateObj = moment.tz(isoDateString, timeZone);
    return dateObj.format('MMMM Do YYYY, h:mm:ss a');
  };

  const formatAvailability = (availability, timeZone) => {
    return availability.map(slot => {
      const start = convertDateToReadableFormat2(slot.start, timeZone);
      const end = convertDateToReadableFormat2(slot.end, timeZone);
      return { start, end, raw: slot };
    });
  };

  const eventContent = (eventInfo) => {
    const statusColors = {
      "Reschedule": "bg-blue-300",
      "upcoming": "bg-blue-300",
      "completed": "bg-green-300",
      "Canceled": "bg-red-300"
    };
    const statusClass = statusColors[eventInfo.event.extendedProps.status] || "bg-gray-300";
    const truncatedTitle = eventInfo.event.title.length > 15 ? `${eventInfo.event.title.slice(0, 15)}...` : eventInfo.event.title;

    return (
      <div className={`p-2 w-[100%] rounded-lg cursor-pointer ${statusClass}`}>
        <strong className="text-sm">{truncatedTitle}</strong>
        <p>{convertDateToReadableFormat(eventInfo.event.start.toISOString())}</p>
      </div>
    );
  };

  const handleInputChange = (e, index, field) => {
    const { value } = e.target;
    const times = [...newAvailability];
    times[index][field] = value;
    setNewAvailability(times);
  };

  const addTimeSlot = () => {
    setNewAvailability([...newAvailability, { start: '', end: '' }]);
  };

  const removeTimeSlot = (index) => {
    const times = [...newAvailability];
    times.splice(index, 1);
    setNewAvailability(times);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/users/availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ availability: { times: newAvailability } })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Availability set successfully');
        setAvailability([...availability, ...newAvailability]);
        setNewAvailability([{ start: '', end: '' }]);
        closeAvailabilityModal();
      } else {
        toast.error(data.message || 'Failed to set availability');
      }
    } catch (error) {
      console.error('Error setting availability:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  const handleDelete = async (slot) => {
    try {
      const response = await fetch(`/api/users/availability`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(slot.raw)
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Availability deleted successfully');
        setAvailability(availability.filter(avail => avail.start !== slot.raw.start || avail.end !== slot.raw.end));
      } else {
        toast.error(data.message || 'Failed to delete availability');
      }
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  const formattedAvailability = formatAvailability(availability, timeZone);

  return (
    <div className="flex gap-[30px] flex-col text-black md:flex-row">
      <ToastContainer />
      <div className="flex-1 mr-[15px]">
        <div className='flex justify-between items-center'>
          <h2 className="text-xl font-bold mt-[10px] text-gray-900">SCHEDULE</h2>
          <button
            onClick={() => setAvailabilityModalIsOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-fit mt-6"
          >
            Set Availability
          </button>
        </div>
        <div className="p-4 h-[80vh] overflow-y-auto">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            firstDay={1}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek,dayGridDay'
            }}
            events={events}
            eventClick={handleEventClick}
            eventContent={eventContent}
          />

          {modalIsOpen && selectedEvent && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-100" style={{ zIndex: "100" }}>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">{selectedEvent.title}</h2>
                <p className="mb-2">Description: {selectedEvent.extendedProps.description}</p>
                <p className="mb-2">Status: {selectedEvent.extendedProps.status}</p>
                <p className="mb-2">Start Time: {convertDateToReadableFormat(selectedEvent.start.toISOString())}</p>
                <p className="mb-2">End Time: {convertDateToReadableFormat(selectedEvent.end?.toISOString()) || "N/A"}</p>
                <div className='flex gap-2 items-center'>
                  {selectedEvent.extendedProps.sessionLink && (
                    <a href={selectedEvent.extendedProps.sessionLink} className="bg-blue-500 hover:text-blue-700 px-4 py-2 rounded text-white">Join The Meet</a>
                  )}
                  <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition w-fit" onClick={closeModal}>Close</button>
                </div>
              </div>
            </div>
          )}

          {availabilityModalIsOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-100" style={{ zIndex: "100" }}>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Set Availability</h3>
                <form onSubmit={handleSubmit}>
                  {newAvailability.map((time, index) => (
                    <div className="mb-4 flex items-center gap-2" key={index}>
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">Time Slot {index + 1}</label>
                        <input
                          type="datetime-local"
                          name="start"
                          value={time.start}
                          onChange={(e) => handleInputChange(e, index, 'start')}
                          className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          placeholder="Start time"
                        />
                        <input
                          type="datetime-local"
                          name="end"
                          value={time.end}
                          onChange={(e) => handleInputChange(e, index, 'end')}
                          className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          placeholder="End time"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        className="mt-6 bg-red-500 text-white px-2 py-2 rounded hover:bg-red-700 transition w-fit"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                  <div className='flex gap-2'>
                    <button
                      type="button"
                      onClick={addTimeSlot}
                      className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-fit"
                    >
                      Add Time Slot
                    </button>
                    <button
                      disabled={newAvailability.length === 0}
                      type="submit"
                      className="bg-green-500 mb-4 text-white px-4 py-2 rounded hover:bg-green-700 transition w-fit"
                    >
                      Set Availability
                    </button>
                  </div>
                </form>
                <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition w-fit mt-4" onClick={closeAvailabilityModal}>Close</button>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-white rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Your Availability</h3>
            {availability.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2">
                {formattedAvailability.map((time, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span className="block text-sm font-medium text-gray-700">
                      {time.start} - {time.end}
                    </span>
                    <button
                      onClick={() => handleDelete(time)}
                      className="ml-4 w-fit bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm font-medium text-gray-700">No availability set.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calender;
