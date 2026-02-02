import { useState } from 'react';
import './RequestCard.css';

export default function RequestCard({
    request,
    onStatusChange,
    onDelete,
    isDraggable = false,
    isCompact = false,
    onCardClick,
    isSelectable = false,
    isSelected = false,
    onSelect
}) {
    const { id, requester, description, status, createdAt } = request;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-TW', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleDragStart = (e) => {
        e.dataTransfer.setData('text/plain', id);
        e.target.classList.add('dragging');
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('dragging');
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm('確定要刪除這個需求嗎？')) {
            onDelete(id);
        }
    };

    const handleCheckboxChange = (e) => {
        e.stopPropagation();
        if (onSelect) {
            onSelect(id);
        }
    };

    const handleCardClick = (e) => {
        // 如果點擊的是按鈕或 checkbox，不觸發卡片點擊
        if (e.target.closest('button') || e.target.closest('input')) return;

        // 如果在選擇模式，點擊卡片就切換選取狀態
        if (isSelectable && onSelect) {
            onSelect(id);
            return;
        }

        if (onCardClick) {
            onCardClick(request);
        }
    };

    const statusLabels = {
        pending: '待處理',
        'in-progress': '進行中',
        completed: '已完成',
    };

    return (
        <div
            className={`request-card glass-card ${status === 'completed' ? 'completed' : ''} ${isCompact ? 'compact' : ''} ${isSelected ? 'selected' : ''}`}
            draggable={isDraggable && !isSelectable}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={handleCardClick}
            style={{ cursor: isSelectable ? 'pointer' : (onCardClick ? 'pointer' : 'grab') }}
        >
            <div className="card-header">
                {isSelectable && (
                    <input
                        type="checkbox"
                        className="select-checkbox"
                        checked={isSelected}
                        onChange={handleCheckboxChange}
                    />
                )}
                <span className="requester">{requester}</span>
                <div className="card-actions">
                    <span className={`status-badge status-badge--${status}`}>
                        {statusLabels[status]}
                    </span>
                    {!isSelectable && (
                        <button
                            className="delete-btn"
                            onClick={handleDelete}
                            title="刪除需求"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            </div>

            <p className={`description ${isCompact ? 'truncated' : ''}`}>{description}</p>

            <div className="card-footer">
                <span className="created-at">🕐 {formatDate(createdAt)}</span>

                {status !== 'completed' && !isSelectable && (
                    <button
                        className="glass-button glass-button-success complete-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(id, 'completed');
                        }}
                    >
                        ✓ 完成
                    </button>
                )}
            </div>
        </div>
    );
}
