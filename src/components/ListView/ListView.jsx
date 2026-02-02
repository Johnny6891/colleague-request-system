import { useState } from 'react';
import { useRequests } from '../../context/RequestContext';
import RequestCard from '../RequestCard';
import './ListView.css';

export default function ListView() {
    const { requests, changeStatus, removeRequest, removeMultipleRequests } = useRequests();
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());

    const pendingRequests = requests.filter((r) => r.status !== 'completed');
    const completedRequests = requests.filter((r) => r.status === 'completed');

    const handleToggleSelect = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleSelectAll = (section) => {
        const items = section === 'pending' ? pendingRequests : completedRequests;
        setSelectedIds((prev) => {
            const next = new Set(prev);
            items.forEach((item) => next.add(item.id));
            return next;
        });
    };

    const handleDeselectAll = () => {
        setSelectedIds(new Set());
    };

    const handleBatchDelete = async () => {
        if (selectedIds.size === 0) return;
        if (window.confirm(`確定要刪除 ${selectedIds.size} 個需求嗎？`)) {
            await removeMultipleRequests([...selectedIds]);
            setSelectedIds(new Set());
            setIsSelectMode(false);
        }
    };

    const handleCancelSelect = () => {
        setSelectedIds(new Set());
        setIsSelectMode(false);
    };

    return (
        <div className="list-view">
            {/* 多選模式控制列 */}
            <div className="select-controls">
                {!isSelectMode ? (
                    <button
                        className="glass-button select-mode-btn"
                        onClick={() => setIsSelectMode(true)}
                    >
                        ☑️ 多選刪除
                    </button>
                ) : (
                    <div className="select-actions">
                        <span className="selected-count">
                            已選取 {selectedIds.size} 項
                        </span>
                        <button
                            className="glass-button"
                            onClick={() => handleSelectAll('pending')}
                        >
                            全選待處理
                        </button>
                        <button
                            className="glass-button"
                            onClick={() => handleSelectAll('completed')}
                        >
                            全選已完成
                        </button>
                        <button
                            className="glass-button"
                            onClick={handleDeselectAll}
                        >
                            取消全選
                        </button>
                        <button
                            className="glass-button glass-button-danger"
                            onClick={handleBatchDelete}
                            disabled={selectedIds.size === 0}
                        >
                            🗑️ 刪除選取 ({selectedIds.size})
                        </button>
                        <button
                            className="glass-button"
                            onClick={handleCancelSelect}
                        >
                            取消
                        </button>
                    </div>
                )}
            </div>

            <section className="list-section">
                <h3 className="section-title">
                    📋 待處理
                    <span className="count">{pendingRequests.length}</span>
                </h3>
                <div className="list-content">
                    {pendingRequests.map((request) => (
                        <RequestCard
                            key={request.id}
                            request={request}
                            onStatusChange={changeStatus}
                            onDelete={removeRequest}
                            isSelectable={isSelectMode}
                            isSelected={selectedIds.has(request.id)}
                            onSelect={handleToggleSelect}
                        />
                    ))}
                    {pendingRequests.length === 0 && (
                        <p className="empty-message">沒有待處理的需求 🎉</p>
                    )}
                </div>
            </section>

            <section className="list-section">
                <h3 className="section-title">
                    ✅ 已完成
                    <span className="count completed">{completedRequests.length}</span>
                </h3>
                <div className="list-content">
                    {completedRequests.map((request) => (
                        <RequestCard
                            key={request.id}
                            request={request}
                            onStatusChange={changeStatus}
                            onDelete={removeRequest}
                            isSelectable={isSelectMode}
                            isSelected={selectedIds.has(request.id)}
                            onSelect={handleToggleSelect}
                        />
                    ))}
                    {completedRequests.length === 0 && (
                        <p className="empty-message">尚無已完成的項目</p>
                    )}
                </div>
            </section>
        </div>
    );
}
