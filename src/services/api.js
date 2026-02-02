const GAS_URL = import.meta.env.VITE_GAS_URL;

// 開發模式：如果沒有設定 GAS_URL，使用 localStorage 作為後備
const USE_LOCAL_STORAGE = !GAS_URL;

/**
 * 從 Google Sheets 取得所有需求
 */
export async function fetchRequests() {
    if (USE_LOCAL_STORAGE) {
        return getLocalRequests();
    }

    try {
        const response = await fetch(`${GAS_URL}?action=getAll`);
        if (!response.ok) throw new Error('Failed to fetch requests');
        const data = await response.json();
        return data.requests || [];
    } catch (error) {
        console.error('Fetch error:', error);
        // Fallback to localStorage
        return getLocalRequests();
    }
}

/**
 * 新增需求到 Google Sheets
 * 使用 GET 請求繞過 CORS 限制
 */
export async function addRequest(request) {
    // 同時存到 localStorage 確保即時顯示
    addLocalRequest(request);

    if (USE_LOCAL_STORAGE) {
        return { success: true };
    }

    try {
        const params = new URLSearchParams({
            action: 'add',
            id: request.id,
            requester: request.requester,
            description: request.description,
            status: request.status,
            createdAt: request.createdAt,
            completedAt: request.completedAt || '',
        });

        // 使用 GET 請求避免 CORS 問題
        const response = await fetch(`${GAS_URL}?${params.toString()}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Add error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 更新需求狀態到 Google Sheets
 */
export async function updateRequest(request) {
    // 同時存到 localStorage
    updateLocalRequest(request);

    if (USE_LOCAL_STORAGE) {
        return { success: true };
    }

    try {
        const params = new URLSearchParams({
            action: 'update',
            id: request.id,
            status: request.status,
            completedAt: request.completedAt || '',
        });

        const response = await fetch(`${GAS_URL}?${params.toString()}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Update error:', error);
        return { success: false, error: error.message };
    }
}

// ========== LocalStorage Fallback ==========

const STORAGE_KEY = 'colleague-requests';

function getLocalRequests() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function addLocalRequest(request) {
    const requests = getLocalRequests();
    requests.unshift(request);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    return { success: true };
}

function updateLocalRequest(request) {
    const requests = getLocalRequests();
    const index = requests.findIndex((r) => r.id === request.id);
    if (index !== -1) {
        requests[index] = { ...requests[index], ...request };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    }
    return { success: true };
}

function deleteLocalRequest(id) {
    const requests = getLocalRequests();
    const filtered = requests.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return { success: true };
}

/**
 * 刪除需求
 */
export async function deleteRequest(id) {
    // 同時從 localStorage 刪除
    deleteLocalRequest(id);

    if (USE_LOCAL_STORAGE) {
        return { success: true };
    }

    try {
        const params = new URLSearchParams({
            action: 'delete',
            id: id,
        });

        const response = await fetch(`${GAS_URL}?${params.toString()}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 使用 Gemini API 優化需求描述
 */
export async function optimizeDescription(description) {
    if (USE_LOCAL_STORAGE) {
        // 本地模式無法使用 AI 優化
        return { success: false, error: '請設定 GAS_URL 以使用 AI 優化功能' };
    }

    try {
        const params = new URLSearchParams({
            action: 'optimize',
            description: description,
        });

        const response = await fetch(`${GAS_URL}?${params.toString()}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Optimize error:', error);
        return { success: false, error: error.message };
    }
}
