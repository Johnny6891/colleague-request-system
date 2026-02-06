import { useEffect } from 'react';
import './DetailModal.css';

export default function DetailModal({ request, onClose }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const statusLabels = {
        pending: '待處理',
        'in-progress': '進行中',
        completed: '已完成',
    };

    if (!request) return null;

    return (
        <div className="detail-overlay" onClick={handleBackdropClick}>
            <div className="detail-content glass-panel">
                <button className="detail-close" onClick={onClose}>✕</button>

                <div className="detail-header">
                    <span className="detail-requester">{request.requester}</span>
                    <span className={`status-badge status-badge--${request.status}`}>
                        {statusLabels[request.status]}
                    </span>
                </div>

                <div className="detail-body">
                    <h3 className="detail-label">需求描述</h3>
                    <p className="detail-description">{request.description}</p>
                </div>

                <div className="detail-footer">
                    <span className="detail-date">🕐 建立於 {formatDate(request.createdAt)}</span>
                    {request.status === 'completed' && request.completedAt && (
                        <span className="detail-date" style={{ marginLeft: '1rem' }}>
                            ✅ 完成於 {formatDate(request.completedAt)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
