import React from 'react';

const RenewalCard = ({ policy }) => {
    const today = new Date();
    const expiry = new Date(policy.end_date);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    const isUrgent = daysLeft < 30;

    return (
        <div style={{
            background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px',
            marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
            <div>
                <h4 style={{margin:0, color: '#1e293b'}}>{policy.title}</h4>
                <p style={{margin:'5px 0', color: '#64748b', fontSize:'0.9rem'}}>Policy #: {policy.policy_number}</p>
                <div style={{
                    display:'inline-block', background: isUrgent ? '#fee2e2' : '#dcfce7',
                    color: isUrgent ? '#b91c1c' : '#15803d', padding: '4px 10px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'bold'
                }}>
                    {daysLeft > 0 ? `Due in ${daysLeft} Days` : 'Expired'}
                </div>
            </div>
            <button style={{
                background: isUrgent ? '#ef4444' : '#2563eb', color: 'white', border:'none',
                padding: '10px 20px', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'
            }}>
                Pay ₹{policy.premium.toLocaleString()}
            </button>
        </div>
    );
};

export default RenewalCard;