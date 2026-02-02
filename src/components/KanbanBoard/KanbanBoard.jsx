import { useState } from 'react';
import { useRequests } from '../../context/RequestContext';
import RequestCard from '../RequestCard';
import DetailModal from '../DetailModal';
import './KanbanBoard.css';

const COLUMNS = [
    { id: 'pending', title: '📋 待處理', color: 'var(--morandi-gray-blue)' },
    { id: 'in-progress', title: '⚙️ 進行中', color: 'var(--morandi-oatmeal)' },
    { id: 'completed', title: '✅ 已完成', color: 'var(--morandi-sage)' },
];

export default function KanbanBoard() {
    const { requests, changeStatus, removeRequest } = useRequests();
    const [dragOverColumn, setDragOverColumn] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const getColumnRequests = (columnId) => {
        return requests.filter((req) => req.status === columnId);
    };

    const handleDragOver = (e, columnId) => {
        e.preventDefault();
        setDragOverColumn(columnId);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = (e, columnId) => {
        e.preventDefault();
        const requestId = e.dataTransfer.getData('text/plain');

        if (requestId) {
            changeStatus(requestId, columnId);
        }

        setDragOverColumn(null);
    };

    const handleCardClick = (request) => {
        setSelectedRequest(request);
    };

    return (
        <>
            <div className="kanban-board">
                {COLUMNS.map((column) => (
                    <div
                        key={column.id}
                        className={`kanban-column glass-panel drop-zone ${dragOverColumn === column.id ? 'drag-over' : ''
                            }`}
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, column.id)}
                    >
                        <div className="column-header">
                            <h3 className="column-title">{column.title}</h3>
                            <span
                                className="column-count"
                                style={{ background: column.color }}
                            >
                                {getColumnRequests(column.id).length}
                            </span>
                        </div>

                        <div className="column-content">
                            {getColumnRequests(column.id).map((request) => (
                                <RequestCard
                                    key={request.id}
                                    request={request}
                                    onStatusChange={changeStatus}
                                    onDelete={removeRequest}
                                    isDraggable={true}
                                    isCompact={true}
                                    onCardClick={handleCardClick}
                                />
                            ))}

                            {getColumnRequests(column.id).length === 0 && (
                                <div className="empty-column">
                                    <span>拖曳卡片到這裡</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {selectedRequest && (
                <DetailModal
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                />
            )}
        </>
    );
}
