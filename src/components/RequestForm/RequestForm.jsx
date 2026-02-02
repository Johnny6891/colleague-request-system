import { useState } from 'react';
import { useRequests } from '../../context/RequestContext';
import { optimizeDescription } from '../../services/api';
import './RequestForm.css';

export default function RequestForm() {
    const { createRequest } = useRequests();
    const [requester, setRequester] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!requester.trim() || !description.trim()) return;

        setIsSubmitting(true);
        try {
            await createRequest({
                requester: requester.trim(),
                description: description.trim(),
            });
            setRequester('');
            setDescription('');
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOptimize = async () => {
        if (!description.trim()) return;

        setIsOptimizing(true);
        try {
            const result = await optimizeDescription(description.trim());
            if (result.success && result.optimized) {
                setDescription(result.optimized);
            } else {
                alert(result.error || '優化失敗，請稍後再試');
            }
        } catch (error) {
            console.error('Optimize error:', error);
            alert('優化失敗，請稍後再試');
        } finally {
            setIsOptimizing(false);
        }
    };

    return (
        <form className="request-form glass-panel" onSubmit={handleSubmit}>
            <h2 className="form-title">📝 新增需求</h2>

            <div className="form-group">
                <label htmlFor="requester">提交人</label>
                <input
                    id="requester"
                    type="text"
                    className="glass-input"
                    placeholder="請輸入您的姓名"
                    value={requester}
                    onChange={(e) => setRequester(e.target.value)}
                    disabled={isSubmitting || isOptimizing}
                />
            </div>

            <div className="form-group">
                <div className="description-header">
                    <label htmlFor="description">需求描述</label>
                    <button
                        type="button"
                        className="glass-button optimize-btn"
                        onClick={handleOptimize}
                        disabled={isOptimizing || !description.trim()}
                    >
                        {isOptimizing ? '優化中...' : '✨ AI 優化'}
                    </button>
                </div>
                <textarea
                    id="description"
                    className="glass-textarea"
                    placeholder="請詳細描述您的需求..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting || isOptimizing}
                />
            </div>

            <button
                type="submit"
                className="glass-button glass-button-primary submit-btn"
                disabled={isSubmitting || isOptimizing || !requester.trim() || !description.trim()}
            >
                {isSubmitting ? '提交中...' : '提交需求'}
            </button>
        </form>
    );
}
