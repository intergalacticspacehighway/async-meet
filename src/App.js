/* eslint-disable no-loop-func */
import { useEffect, useReducer, useState } from "react";

const getId = () => Math.random().toString();

const reducer = (state, action) => {
  switch (action.type) {
    case "insert": {
      return state.concat({
        id: getId(),
      });
    }
    case "setName": {
      return state.map((s) => {
        if (s.id === action.payload.id) {
          return { ...s, name: action.payload.name };
        }
        return s;
      });
    }
    case "setStartHour": {
      return state.map((s) => {
        if (s.id === action.payload.id) {
          return { ...s, start: action.payload.start };
        }
        return s;
      });
    }
    case "delete": {
      return state.filter((s) => {
        return s.id !== action.payload.id;
      });
    }
    case "setEndHour": {
      return state.map((s) => {
        if (s.id === action.payload.id) {
          return { ...s, end: action.payload.end };
        }
        return s;
      });
    }
    default:
      return state;
  }
};

const updateLocalStore = (state) => {
  localStorage.setItem("store", JSON.stringify(state));
};
const retrieveLocalStore = () => {
  return JSON.parse(localStorage.getItem("store")) || [];
};

const initialState = retrieveLocalStore();

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [peopleForMeeting, setPeopleForMeeting] = useState([]);
  const [overlappingSlots, setOverlappingSlots] = useState(null);

  const setName = (id, name) => {
    dispatch({ payload: { id, name }, type: "setName" });
  };

  const setStartHour = (id, start) => {
    dispatch({
      payload: { id, start: parseFloat(start) },
      type: "setStartHour",
    });
  };

  const setEndHour = (id, end) => {
    dispatch({ payload: { id, end: parseFloat(end) }, type: "setEndHour" });
  };

  const insert = (id) => {
    dispatch({ payload: { id }, type: "insert" });
  };

  const handleDelete = (id) => {
    setPeopleForMeeting((peopleForMeeting) =>
      peopleForMeeting.filter((p) => p !== id)
    );
    dispatch({ payload: { id }, type: "delete" });
  };

  useEffect(() => {
    if (peopleForMeeting.length > 1) {
      let availabilities = {};
      state.forEach((s) => {
        availabilities[s.id] = {
          name: s.id,
          hours: { start: s.start, end: s.end },
          days: [1, 2, 3, 4, 5],
        };
      });

      const timings = getOverlap({ availabilities, people: peopleForMeeting });
      setOverlappingSlots(timings);
    }
    return () => {
      setOverlappingSlots(null);
    };
  }, [peopleForMeeting, state]);

  useEffect(() => {
    updateLocalStore(state);
  }, [state]);

  return (
    <div>
      {state.map((s) => {
        return (
          <div key={s.id} className="grid">
            <div>
              <label>
                name
                <input
                  type="text"
                  autoFocus
                  onChange={(e) => setName(s.id, e.target.value)}
                  value={s.name}
                />
              </label>
            </div>
            <div>
              <label>
                start hour
                <select
                  type="text"
                  onChange={(e) => setStartHour(s.id, e.target.value)}
                  value={s.start}
                >
                  {hours
                    .filter((h) => (s.end ? h < s.end : true))
                    .map((h) => {
                      return (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      );
                    })}
                </select>
              </label>
            </div>
            <div>
              <label>
                end hour
                <select
                  type="text"
                  onChange={(e) => setEndHour(s.id, e.target.value)}
                  value={s.end}
                >
                  {hours
                    .filter((h) => (s.start ? h > s.start : true))
                    .map((h) => {
                      return (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      );
                    })}
                </select>
              </label>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <input
                type="checkbox"
                value={s.id}
                checked={peopleForMeeting.includes(s.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setPeopleForMeeting(peopleForMeeting.concat(s.id));
                  } else {
                    setPeopleForMeeting(
                      peopleForMeeting.filter((p) => p !== s.id)
                    );
                  }
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <button onClick={() => handleDelete(s.id)}>delete</button>
            </div>
          </div>
        );
      })}

      <button
        className="outline secondary"
        onClick={insert}
        style={{ flexGrow: 1 }}
      >
        add peeps
      </button>

      {overlappingSlots ? (
        <div>
          Overlapping slot between{" "}
          {peopleForMeeting
            .map((p) => state.find((s) => s.id === p).name)
            .join(", ")}{" "}
          is {overlappingSlots.slotStart} to {overlappingSlots.slotEnd}
        </div>
      ) : null}
    </div>
  );
}

const hours = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23, 24,
];

// const days = [
//   "sunday",
//   "monday",
//   "tuesday",
//   "wednesday",
//   "thursday",
//   "friday",
//   "saturday",
//   "sunday",
// ];

function getOverlap({ availabilities, people }) {
  if (people.length < 2) {
    console.log("make some frens please!");
    return;
  }
  const person = people[0];
  const availabilityOfPerson = availabilities[person];
  let slotStart = availabilityOfPerson.hours.start;
  let slotEnd = availabilityOfPerson.hours.end;

  for (let i = 1; i < people.length; i++) {
    const nextPerson = people[i];
    const availabilityOfNextPerson = availabilities[nextPerson];
    // availabilityOfPerson.days.forEach((d1) => {
    // if (availabilityOfNextPerson.days.includes(d1)) {
    slotStart = Math.max(slotStart, availabilityOfNextPerson.hours.start);
    slotEnd = Math.min(slotEnd, availabilityOfNextPerson.hours.end);
    // }
    // });
  }

  if (
    slotStart >= availabilityOfPerson.hours.start &&
    slotEnd <= availabilityOfPerson.hours.end
  ) {
    console.log("overlapping times ", slotStart, slotEnd);
    return { slotStart, slotEnd };
  } else {
    console.log("Please ask your frens to make some adjustments!");
  }
}

const availabilities = {
  nishan: {
    name: "nishan",
    hours: { start: 10, end: 5 },
    days: [0, 1, 4, 2],
  },
  axel: {
    name: "axel",
    hours: { start: 12, end: 20 },
    days: [0, 1, 4, 2],
  },
};

const people = ["nishan", "axel"];

getOverlap({ availabilities, people });
export default App;

// function getAllOverlaps({ availabilities }) {
//   let totalOverlappingTimes = [];
//   for (let i = 0; i < availabilities.length - 1; i++) {
//     const availability1 = availabilities[i];
//     let matchedMap = { name: availability1.name, with: [] };
//     let slotStart = availability1.hours.start;
//     let slotEnd = availability1.hours.end;

//     for (let j = 1; j < availabilities.length; j++) {
//       const availability2 = availabilities[j];
//       availability1.days.forEach((d1) => {
//         if (availability2.days.includes(d1)) {
//           slotStart = Math.max(slotStart, availability2.hours.start);
//           slotEnd = Math.min(slotEnd, availability2.hours.end);

//           if (
//             slotStart >= availability1.hours.start &&
//             slotEnd <= availability1.hours.end
//           ) {
//             matchedMap.with.push({
//               name: availability2.name,
//               day: d1,
//               slotStart,
//               slotEnd,
//             });
//           }
//         }
//       });
//     }

//     totalOverlappingTimes.push(availability1);
//   }
// }
