const HTTP_METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH']);

const toQueryObject = (searchParams) => {
  const query = {};
  for (const [key, value] of searchParams.entries()) {
    if (query[key] === undefined) {
      query[key] = value;
    } else if (Array.isArray(query[key])) {
      query[key].push(value);
    } else {
      query[key] = [query[key], value];
    }
  }
  return query;
};

const decorateResponse = (res) => {
  if (!res.status) {
    res.status = (statusCode) => {
      res.statusCode = statusCode;
      return res;
    };
  }

  if (!res.json) {
    res.json = (payload) => {
      if (!res.headersSent) {
        res.setHeader('content-type', 'application/json; charset=utf-8');
      }
      res.end(JSON.stringify(payload));
    };
  }

  return res;
};

const parseJsonBody = async (req) => {
  if (!HTTP_METHODS_WITH_BODY.has(req.method)) {
    return req.body || {};
  }

  if (req.body !== undefined) {
    if (typeof req.body === 'string') {
      return req.body ? JSON.parse(req.body) : {};
    }
    return req.body || {};
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody ? JSON.parse(rawBody) : {};
};

const sendMethodNotAllowed = (res) => {
  res.status(405).json({ message: 'Method not allowed' });
};

const sendNotFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.url}` });
};

const applyAuth = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Not authorized, token missing' });
    return false;
  }

  try {
    const { verifyToken } = await import('../backend/utils/jwt.js');
    const decoded = verifyToken(authHeader.split(' ')[1]);
    req.user = {
      _id: decoded.id,
      name: decoded.name || 'User',
      email: decoded.email || '',
      role: decoded.role,
      doctorId: decoded.doctorId || null
    };
    return true;
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token invalid' });
    return false;
  }
};

const requireDatabase = async (res) => {
  try {
    const { connectDB } = await import('../backend/config/db.js');
    await connectDB(process.env.MONGO_URI);
    return true;
  } catch (error) {
    res.status(503).json({ message: error.message || 'Database temporarily unavailable' });
    return false;
  }
};

const routeRequest = async (req, res, pathname) => {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (pathname === '/api/health' || pathname === '/health') {
    if (req.method !== 'GET') return sendMethodNotAllowed(res);
    res.json({
      status: 'ok',
      message: 'MediConnect API running',
      commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
      runtime: 'direct-vercel-handler'
    });
    return;
  }

  if (pathname === '/api/auth/login' || pathname === '/auth/login') {
    if (req.method !== 'POST') return sendMethodNotAllowed(res);
    const { login } = await import('../backend/controllers/authController.js');
    await login(req, res);
    return;
  }

  if (pathname === '/api/auth/register' || pathname === '/auth/register') {
    if (req.method !== 'POST') return sendMethodNotAllowed(res);
    const { register } = await import('../backend/controllers/authController.js');
    await register(req, res);
    return;
  }

  if (pathname === '/api/auth/me' || pathname === '/auth/me') {
    if (req.method !== 'GET') return sendMethodNotAllowed(res);
    if (!(await applyAuth(req, res))) return;
    const { me } = await import('../backend/controllers/authController.js');
    await me(req, res);
    return;
  }

  if (pathname === '/api/doctors' || pathname === '/doctors') {
    if (req.method !== 'GET') return sendMethodNotAllowed(res);
    const { getDoctors } = await import('../backend/controllers/doctorController.js');
    await getDoctors(req, res);
    return;
  }

  if (pathname === '/api/doctors/slots' || pathname === '/doctors/slots') {
    if (!req.query.id) {
      res.status(400).json({ message: 'Doctor id is required' });
      return;
    }

    req.params = { id: req.query.id };
    const { getDoctorSlots, updateDoctorSlots } = await import('../backend/controllers/doctorController.js');

    if (req.method === 'GET') {
      await getDoctorSlots(req, res);
      return;
    }

    if (req.method === 'PATCH') {
      if (!(await applyAuth(req, res))) return;
      if (!(await requireDatabase(res))) return;
      await updateDoctorSlots(req, res);
      return;
    }

    return sendMethodNotAllowed(res);
  }

  const doctorSlotsMatch = pathname.match(/^\/(?:api\/)?doctors\/([^/]+)\/slots$/);
  if (doctorSlotsMatch) {
    req.params = { id: decodeURIComponent(doctorSlotsMatch[1]) };
    const { getDoctorSlots, updateDoctorSlots } = await import('../backend/controllers/doctorController.js');

    if (req.method === 'GET') {
      await getDoctorSlots(req, res);
      return;
    }

    if (req.method === 'PATCH') {
      if (!(await applyAuth(req, res))) return;
      if (!(await requireDatabase(res))) return;
      await updateDoctorSlots(req, res);
      return;
    }

    return sendMethodNotAllowed(res);
  }

  const doctorMatch = pathname.match(/^\/(?:api\/)?doctors\/([^/]+)$/);
  if (doctorMatch) {
    if (req.method !== 'GET') return sendMethodNotAllowed(res);
    req.params = { id: decodeURIComponent(doctorMatch[1]) };
    const { getDoctorById } = await import('../backend/controllers/doctorController.js');
    await getDoctorById(req, res);
    return;
  }

  if (pathname === '/api/appointments' || pathname === '/appointments') {
    if (req.method !== 'POST') return sendMethodNotAllowed(res);
    if (!(await applyAuth(req, res))) return;
    if (!(await requireDatabase(res))) return;
    const { createAppointment } = await import('../backend/controllers/appointmentController.js');
    await createAppointment(req, res);
    return;
  }

  if (pathname === '/api/appointments/me' || pathname === '/appointments/me') {
    if (req.method !== 'GET') return sendMethodNotAllowed(res);
    if (!(await applyAuth(req, res))) return;
    if (!(await requireDatabase(res))) return;
    const { getMyAppointments } = await import('../backend/controllers/appointmentController.js');
    await getMyAppointments(req, res);
    return;
  }

  const appointmentMatch = pathname.match(/^\/(?:api\/)?appointments\/([^/]+)$/);
  if (appointmentMatch) {
    req.params = { id: decodeURIComponent(appointmentMatch[1]) };
    if (!(await applyAuth(req, res))) return;
    if (!(await requireDatabase(res))) return;

    if (req.method === 'PATCH') {
      const { updateAppointment } = await import('../backend/controllers/appointmentController.js');
      await updateAppointment(req, res);
      return;
    }

    if (req.method === 'DELETE') {
      const { cancelAppointment } = await import('../backend/controllers/appointmentController.js');
      await cancelAppointment(req, res);
      return;
    }

    return sendMethodNotAllowed(res);
  }

  sendNotFound(req, res);
};

module.exports = async (req, res) => {
  decorateResponse(res);
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type,authorization');
  res.setHeader('cache-control', 'no-store');
  res.setHeader('x-mediconnect-handler', 'direct-vercel-handler');

  try {
    const requestUrl = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
    req.query = { ...toQueryObject(requestUrl.searchParams), ...(req.query || {}) };
    req.params = req.params || {};
    req.body = await parseJsonBody(req);
    await routeRequest(req, res, requestUrl.pathname.replace(/\/+$/, '') || '/');
  } catch (error) {
    console.error('Handler error:', error);
    const statusCode = error instanceof SyntaxError ? 400 : 500;
    res.status(statusCode).json({ message: error.message || 'Server error' });
  }
};
