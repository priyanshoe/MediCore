import axios from 'axios';

/**
 * REST API client configuration
 * In a local development environment with JSON Server:
 * json-server --watch db.json --port 3001
 * baseURL: "http://localhost:3001"
 */
const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Seed data based on db.json to provide seamless in-browser fallback
// when json-server is not reachable (such as in remote cloud container previews)
const INITIAL_DB = {
  users: [
    {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "ADMIN",
      status: "Active"
    },
    {
      id: 2,
      name: "Dr. Rahul Sharma",
      email: "doctor@example.com",
      password: "password123",
      role: "DOCTOR",
      phone: "9876543210",
      specialization: "Cardiology",
      qualification: "MBBS, MD (Cardiology)",
      experience: 8,
      consultationFee: 500,
      profileImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
      availability: "Mon-Fri (09:00 - 17:00)",
      status: "Active"
    },
    {
      id: 3,
      name: "Dr. Sarah Jenkins",
      email: "sarah.jenkins@example.com",
      password: "password123",
      role: "DOCTOR",
      phone: "9876543211",
      specialization: "Pediatrics",
      qualification: "MBBS, DCH, MD",
      experience: 6,
      consultationFee: 400,
      profileImage: "https://images.unsplash.com/photo-1594824813583-7853b0e36746?w=400&auto=format&fit=crop&q=80",
      availability: "Mon-Sat (10:00 - 16:00)",
      status: "Active"
    },
    {
      id: 4,
      name: "Dr. Amit Patel",
      email: "amit.patel@example.com",
      password: "password123",
      role: "DOCTOR",
      phone: "9876543212",
      specialization: "Neurology",
      qualification: "MBBS, DM (Neurology)",
      experience: 12,
      consultationFee: 750,
      profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80",
      availability: "Tue-Sat (11:00 - 18:00)",
      status: "Active"
    },
    {
      id: 5,
      name: "John Doe",
      email: "patient@example.com",
      password: "password123",
      role: "PATIENT",
      phone: "9876543213",
      dateOfBirth: "1998-05-14",
      gender: "Male",
      address: "124 Park Avenue, Metro City",
      status: "Active"
    },
    {
      id: 6,
      name: "Emily Watson",
      email: "emily@example.com",
      password: "password123",
      role: "PATIENT",
      phone: "9876543214",
      dateOfBirth: "2001-11-22",
      gender: "Female",
      address: "45 Lakeview Drive, Sunnyvale",
      status: "Active"
    }
  ],
  appointments: [
    {
      id: 1,
      patientId: 5,
      doctorId: 2,
      date: "2026-09-10",
      time: "10:00",
      reason: "Regular cardiac checkup and blood pressure monitoring",
      status: "COMPLETED",
      createdAt: "2026-09-01"
    },
    {
      id: 2,
      patientId: 5,
      doctorId: 3,
      date: "2026-09-15",
      time: "11:30",
      reason: "Seasonal allergy consultation and wellness assessment",
      status: "ACCEPTED",
      createdAt: "2026-09-02"
    },
    {
      id: 3,
      patientId: 6,
      doctorId: 2,
      date: "2026-09-18",
      time: "14:00",
      reason: "Occasional palpitations and fatigue consultation",
      status: "PENDING",
      createdAt: "2026-09-03"
    },
    {
      id: 4,
      patientId: 5,
      doctorId: 4,
      date: "2026-09-22",
      time: "15:30",
      reason: "Migraine headache frequency review",
      status: "PENDING",
      createdAt: "2026-09-04"
    }
  ],
  prescriptions: [
    {
      id: 1,
      doctorId: 2,
      patientId: 5,
      appointmentId: 1,
      diagnosis: "Mild Hypertension & Work-related Fatigue",
      medicines: [
        {
          name: "Amlodipine",
          dosage: "5mg",
          frequency: "Once daily in morning"
        },
        {
          name: "Vitamin B-Complex",
          dosage: "1 tablet",
          frequency: "Once daily after lunch"
        }
      ],
      instructions: "Take medicines after meals. Drink at least 2.5L water daily and limit dietary sodium.",
      notes: "Patient advised to log daily morning blood pressure readings.",
      followUpDate: "2026-09-30"
    }
  ]
};

// Helper: load local mock db
function getMockDb() {
  const saved = localStorage.getItem('medical_db');
  if (!saved) {
    localStorage.setItem('medical_db', JSON.stringify(INITIAL_DB));
    return INITIAL_DB;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    localStorage.setItem('medical_db', JSON.stringify(INITIAL_DB));
    return INITIAL_DB;
  }
}

// Helper: save local mock db
function saveMockDb(db) {
  localStorage.setItem('medical_db', JSON.stringify(db));
}

export function resetMockData() {
  localStorage.setItem('medical_db', JSON.stringify(INITIAL_DB));
  return INITIAL_DB;
}

/**
 * Handle JSON Server REST operations in localStorage
 * Matches standard JSON Server routes:
 * GET    /collection
 * GET    /collection/:id
 * POST   /collection
 * PATCH  /collection/:id
 * PUT    /collection/:id
 * DELETE /collection/:id
 */
function handleMockRequest(config) {
  const db = getMockDb();
  let url = config.url || '';

  // Remove baseURL or leading slash
  if (url.startsWith(API_BASE_URL)) {
    url = url.substring(API_BASE_URL.length);
  }
  if (url.startsWith('/')) {
    url = url.substring(1);
  }

  // Parse path and query params
  const [pathPart, queryPart] = url.split('?');
  const pathSegments = pathPart.split('/').filter(Boolean);
  const collectionName = pathSegments[0];
  const itemId = pathSegments[1];

  const params = {};
  if (queryPart) {
    const searchParams = new URLSearchParams(queryPart);
    searchParams.forEach((val, key) => {
      params[key] = val;
    });
  }
  if (config.params) {
    Object.assign(params, config.params);
  }

  if (!db[collectionName]) {
    db[collectionName] = [];
  }

  const method = (config.method || 'get').toUpperCase();
  const collection = db[collectionName];

  if (method === 'GET') {
    if (itemId) {
      const item = collection.find(i => String(i.id) === String(itemId));
      if (!item) {
        return Promise.reject({
          response: { status: 404, data: 'Item not found' }
        });
      }
      return Promise.resolve({ data: item, status: 200, statusText: 'OK' });
    }

    // Filter collection if params provided
    let results = [...collection];
    Object.keys(params).forEach(key => {
      const targetVal = String(params[key]).toLowerCase();
      results = results.filter(item => {
        if (item[key] === undefined) return false;
        return String(item[key]).toLowerCase() === targetVal;
      });
    });

    return Promise.resolve({ data: results, status: 200, statusText: 'OK' });
  }

  if (method === 'POST') {
    let payload = config.data;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch (e) { }
    }
    const maxId = collection.reduce((max, i) => Math.max(max, Number(i.id) || 0), 0);
    const newItem = {
      ...payload,
      id: payload.id || (maxId + 1),
    };
    collection.push(newItem);
    saveMockDb(db);
    return Promise.resolve({ data: newItem, status: 201, statusText: 'Created' });
  }

  if (method === 'PATCH' || method === 'PUT') {
    let payload = config.data;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch (e) { }
    }
    const index = collection.findIndex(i => String(i.id) === String(itemId));
    if (index === -1) {
      return Promise.reject({
        response: { status: 404, data: 'Item not found' }
      });
    }
    const updated = {
      ...collection[index],
      ...payload,
      id: collection[index].id, // preserve id
    };
    collection[index] = updated;
    saveMockDb(db);
    return Promise.resolve({ data: updated, status: 200, statusText: 'OK' });
  }

  if (method === 'DELETE') {
    const index = collection.findIndex(i => String(i.id) === String(itemId));
    if (index === -1) {
      return Promise.reject({
        response: { status: 404, data: 'Item not found' }
      });
    }
    const removed = collection.splice(index, 1)[0];
    saveMockDb(db);
    return Promise.resolve({ data: removed, status: 200, statusText: 'OK' });
  }

  return Promise.reject({
    response: { status: 405, data: 'Method not supported' }
  });
}

// Custom adapter: Try local JSON Server if on pure localhost HTTP,
// or fallback instantly to in-browser localStorage mock for smooth preview
api.defaults.adapter = async function customAdapter(config) {
  // If running in HTTPS or remote preview, localhost:3001 will always fail (CORS/mixed content)
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

  if (!isHttps) {
    try {
      // Attempt default XMLHttpRequest / fetch adapter
      const defaultAdapter = axios.getAdapter('xhr') || axios.getAdapter('fetch');
      if (defaultAdapter) {
        return await defaultAdapter(config);
      }
    } catch (err) {
      // Network error (json-server not running) -> gracefully use mock storage
      return handleMockRequest(config);
    }
  }

  // Fallback in-browser JSON Server simulation
  return handleMockRequest(config);
};

export default api;
