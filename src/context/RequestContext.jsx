import { createContext, useContext, useReducer, useEffect } from 'react';
import { fetchRequests, addRequest, updateRequest, deleteRequest } from '../services/api';

const RequestContext = createContext(null);

// Action Types
const ACTIONS = {
  SET_REQUESTS: 'SET_REQUESTS',
  ADD_REQUEST: 'ADD_REQUEST',
  UPDATE_STATUS: 'UPDATE_STATUS',
  DELETE_REQUEST: 'DELETE_REQUEST',
  BATCH_DELETE: 'BATCH_DELETE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_VIEW_MODE: 'SET_VIEW_MODE',
};

// Initial State
const initialState = {
  requests: [],
  loading: false,
  error: null,
  viewMode: 'kanban', // 'list' | 'kanban'
};

// Reducer
function requestReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_REQUESTS:
      return { ...state, requests: action.payload, loading: false };

    case ACTIONS.ADD_REQUEST:
      return { ...state, requests: [action.payload, ...state.requests] };

    case ACTIONS.UPDATE_STATUS:
      return {
        ...state,
        requests: state.requests.map((req) =>
          req.id === action.payload.id
            ? {
              ...req,
              status: action.payload.status,
              completedAt: action.payload.status === 'completed'
                ? new Date().toISOString()
                : null
            }
            : req
        ),
      };

    case ACTIONS.DELETE_REQUEST:
      return {
        ...state,
        requests: state.requests.filter((req) => req.id !== action.payload),
      };

    case ACTIONS.BATCH_DELETE:
      return {
        ...state,
        requests: state.requests.filter((req) => !action.payload.includes(req.id)),
      };

    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case ACTIONS.SET_VIEW_MODE:
      return { ...state, viewMode: action.payload };

    default:
      return state;
  }
}

// Provider Component
export function RequestProvider({ children }) {
  const [state, dispatch] = useReducer(requestReducer, initialState);

  // Load requests on mount
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const data = await fetchRequests();
      dispatch({ type: ACTIONS.SET_REQUESTS, payload: data });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const createRequest = async (requestData) => {
    try {
      const newRequest = {
        id: crypto.randomUUID(),
        ...requestData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        completedAt: null,
      };

      dispatch({ type: ACTIONS.ADD_REQUEST, payload: newRequest });

      // Sync to Google Sheets
      await addRequest(newRequest);

      return newRequest;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const changeStatus = async (id, status) => {
    dispatch({ type: ACTIONS.UPDATE_STATUS, payload: { id, status } });

    try {
      const request = state.requests.find((r) => r.id === id);
      if (request) {
        await updateRequest({
          ...request,
          status,
          completedAt: status === 'completed' ? new Date().toISOString() : null,
        });
      }
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      // Optionally revert the change
    }
  };

  const removeRequest = async (id) => {
    dispatch({ type: ACTIONS.DELETE_REQUEST, payload: id });

    try {
      await deleteRequest(id);
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const removeMultipleRequests = async (ids) => {
    dispatch({ type: ACTIONS.BATCH_DELETE, payload: ids });

    try {
      await Promise.all(ids.map((id) => deleteRequest(id)));
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const setViewMode = (mode) => {
    dispatch({ type: ACTIONS.SET_VIEW_MODE, payload: mode });
  };

  const value = {
    ...state,
    createRequest,
    changeStatus,
    removeRequest,
    removeMultipleRequests,
    setViewMode,
    loadRequests,
  };

  return (
    <RequestContext.Provider value={value}>
      {children}
    </RequestContext.Provider>
  );
}

// Hook
export function useRequests() {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
}
