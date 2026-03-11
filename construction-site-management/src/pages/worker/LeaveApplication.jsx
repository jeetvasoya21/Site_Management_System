/**
 * LeaveApplication Page
 * Workers submit leave requests; Site Engineers can approve/reject
 */

import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { Card, Badge, Button, Input, Select, Modal } from '../../components/ui';
import { Plus, Check, X, FileText } from 'lucide-react';

const LEAVE_TYPES = ['Personal', 'Medical', 'Emergency', 'Vacation', 'Other'];

const defaultForm = {
  start_date: '',
  end_date: '',
  reason: '',
  leave_type: 'Personal',
};

export default function LeaveApplication() {
  const { workers, leaveApplications, applyLeave, approveLeave, rejectLeave, users } =
    useContext(AppContext);
  const { user } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [rejectModal, setRejectModal] = useState(null); // leave id being rejected
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const isWorker = user?.role === 'Worker';
  const isSiteEngineer = user?.role === 'Site_Engineer' || user?.role === 'Admin' || user?.role === 'Project_Manager';

  // Find this user's worker record
  const myWorker = useMemo(
    () => workers.find((w) => w.userId === user?.id),
    [workers, user]
  );

  // Which applications to show
  const visibleApplications = useMemo(() => {
    let apps = leaveApplications;
    if (isWorker && myWorker) {
      apps = apps.filter((l) => l.workerId === myWorker.id);
    }
    if (filterStatus !== 'all') {
      apps = apps.filter((l) => l.status === filterStatus);
    }
    return [...apps].sort((a, b) => b.applied_at.localeCompare(a.applied_at));
  }, [leaveApplications, isWorker, myWorker, filterStatus]);

  const getWorkerName = (workerId) => workers.find((w) => w.id === workerId)?.name || workerId;
  const getReviewerName = (userId) => {
    if (!userId) return '—';
    return users.find((u) => u.id === userId)?.name || userId;
  };

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.start_date || !form.end_date || !form.reason) {
      showToast('Please fill all required fields.', 'error');
      return;
    }
    if (form.end_date < form.start_date) {
      showToast('End date cannot be before start date.', 'error');
      return;
    }
    if (!myWorker) {
      showToast('Worker profile not linked to your account.', 'error');
      return;
    }
    applyLeave({ ...form, workerId: myWorker.id });
    setForm(defaultForm);
    setShowForm(false);
    showToast('Leave application submitted successfully.');
  };

  const handleApprove = (leaveId) => {
    approveLeave(leaveId, user.id);
    showToast('Leave approved.');
  };

  const handleRejectConfirm = () => {
    if (!rejectModal) return;
    rejectLeave(rejectModal, user.id, rejectReason);
    setRejectModal(null);
    setRejectReason('');
    showToast('Leave rejected.', 'error');
  };

  const statusVariant = (status) => {
    if (status === 'Approved') return 'success';
    if (status === 'Rejected') return 'danger';
    return 'warning';
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Leave Applications</h1>
          <p className="text-slate-400 mt-1">
            {isWorker ? 'Submit and track your leave requests' : 'Review and manage worker leave requests'}
          </p>
        </div>
        {isWorker && (
          <Button onClick={() => setShowForm(true)}>
            <Plus size={14} className="mr-1" /> Apply Leave
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3">
          {['all', 'Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-50'
              }`}
            >
              {status === 'all' ? 'All' : status}
              &nbsp;(
              {status === 'all'
                ? leaveApplications.filter((l) => isWorker && myWorker ? l.workerId === myWorker.id : true).length
                : leaveApplications.filter((l) => (isWorker && myWorker ? l.workerId === myWorker.id : true) && l.status === status).length}
              )
            </button>
          ))}
        </div>
      </Card>

      {/* Applications List */}
      <Card title="Applications">
        {visibleApplications.length === 0 ? (
          <div className="text-center py-10">
            <FileText size={40} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">No leave applications found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {!isWorker && <th className="text-left py-3 px-4 text-slate-400 text-sm">Worker</th>}
                  <th className="text-left py-3 px-4 text-slate-400 text-sm">Type</th>
                  <th className="text-left py-3 px-4 text-slate-400 text-sm">From</th>
                  <th className="text-left py-3 px-4 text-slate-400 text-sm">To</th>
                  <th className="text-left py-3 px-4 text-slate-400 text-sm">Reason</th>
                  <th className="text-left py-3 px-4 text-slate-400 text-sm">Status</th>
                  <th className="text-left py-3 px-4 text-slate-400 text-sm">Reviewed By</th>
                  {isSiteEngineer && <th className="text-left py-3 px-4 text-slate-400 text-sm">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {visibleApplications.map((leave) => (
                  <tr key={leave.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                    {!isWorker && (
                      <td className="py-3 px-4 text-slate-50 font-medium">{getWorkerName(leave.workerId)}</td>
                    )}
                    <td className="py-3 px-4">
                      <Badge variant="status">{leave.leave_type}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-sm">{leave.start_date}</td>
                    <td className="py-3 px-4 text-slate-400 text-sm">{leave.end_date}</td>
                    <td className="py-3 px-4 text-slate-300 text-sm max-w-xs truncate">{leave.reason}</td>
                    <td className="py-3 px-4">
                      <Badge variant={statusVariant(leave.status)}>{leave.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-sm">{getReviewerName(leave.reviewed_by)}</td>
                    {isSiteEngineer && (
                      <td className="py-3 px-4">
                        {leave.status === 'Pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(leave.id)}
                              className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => { setRejectModal(leave.id); setRejectReason(''); }}
                              className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Apply Leave Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Apply for Leave">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Leave Type"
            value={form.leave_type}
            options={LEAVE_TYPES.map((t) => ({ value: t, label: t }))}
            onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
          />
          <Input
            label="Start Date"
            type="date"
            required
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
          <Input
            label="End Date"
            type="date"
            required
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Reason <span className="text-rose-500">*</span></label>
            <textarea
              required
              rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Describe your reason for leave..."
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">Submit Application</Button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Leave">
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">Provide a reason for rejecting this leave request (optional):</p>
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Rejection reason..."
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleRejectConfirm}>Reject Leave</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
