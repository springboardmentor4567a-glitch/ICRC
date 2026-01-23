def claim_created_template(claim_no):
    return f"""
    <h2>Claim Submitted Successfully</h2>
    <p>Your claim <b>{claim_no}</b> has been submitted.</p>
    <p>Status: Pending Review</p>
    """

def claim_status_template(claim_no, status):
    return f"""
    <h2>Claim Status Update</h2>
    <p>Claim Number: <b>{claim_no}</b></p>
    <p>Current Status: <b>{status}</b></p>
    """

def claim_approved_template(claim_no):
    return f"""
    <h2>Claim Approved 🎉</h2>
    <p>Your claim <b>{claim_no}</b> has been approved.</p>
    """

