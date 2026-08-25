import re
import models

def handle_chat_message(message: str, db) -> str:
    msg = message.lower().strip()
    
    # ── 1. CHEAPEST TRAVEL POLICY ──
    if "travel" in msg and any(x in msg for x in ["lowest", "cheapest", "cheap", "minimum", "less", "least"]):
        travel_policies = db.query(models.Policy).filter(models.Policy.category.ilike("%travel%")).all()
        if not travel_policies:
            return "I couldn't find any travel insurance policies in the database right now."
        
        cheapest = min(travel_policies, key=lambda p: p.premium if p.premium is not None else float('inf'))
        provider = db.query(models.Provider).filter(models.Provider.id == cheapest.provider_id).first()
        provider_name = provider.name if provider else "insurer"
        
        return (
            f"The travel insurance policy with the lowest premium is **{cheapest.name}** offered by **{provider_name}**.\n\n"
            f"- **Annual Premium**: ₹{int(cheapest.premium):,}\n"
            f"- **Coverage**: ₹{cheapest.coverage}\n"
            f"- **Key Benefits**: {cheapest.benefits}\n\n"
            f"You can view this plan in the **Browse Policies** section."
        )

    # ── 2. STAR HEALTH SENIOR ──
    if "senior" in msg and any(x in msg for x in ["star", "health", "senior"]):
        policy = db.query(models.Policy).filter(models.Policy.name.ilike("%Star Health Senior%")).first()
        if policy:
            provider = db.query(models.Provider).filter(models.Provider.id == policy.provider_id).first()
            prov_name = provider.name if provider else "Star Health"
            return (
                f"Here are the details for **{policy.name}**:\n\n"
                f"- **Insurer**: {prov_name}\n"
                f"- **Category**: Health Insurance\n"
                f"- **Coverage**: ₹{policy.coverage}\n"
                f"- **Annual Premium**: ₹{int(policy.premium):,}\n"
                f"- **Benefits**: {policy.benefits}\n"
                f"- **Key Terms**: {policy.terms_conditions}"
            )

    # ── 3. LIC CHILD SECURE ──
    if "child" in msg and any(x in msg for x in ["lic", "secure", "child"]):
        policy = db.query(models.Policy).filter(models.Policy.name.ilike("%LIC Child Secure%")).first()
        if policy:
            provider = db.query(models.Provider).filter(models.Provider.id == policy.provider_id).first()
            prov_name = provider.name if provider else "LIC"
            return (
                f"Here are the details for **{policy.name}**:\n\n"
                f"- **Insurer**: {prov_name}\n"
                f"- **Category**: Life Insurance\n"
                f"- **Coverage**: ₹{policy.coverage}\n"
                f"- **Annual Premium**: ₹{int(policy.premium):,}\n"
                f"- **Benefits**: {policy.benefits}\n"
                f"- **Key Terms**: {policy.terms_conditions}"
            )

    # ── 4. CLAIM DOCUMENTS ──
    if "claim" in msg and any(x in msg for x in ["document", "require", "upload", "proof", "attach", "bill", "receipt"]):
        return (
            "When filing a claim, you should upload the following supporting documents in Step 2 of the form:\n\n"
            "- A valid government-issued ID proof.\n"
            "- Original medical bills, diagnosis reports, or discharge summaries (for health claims).\n"
            "- Proof of incident, receipts, or police report (for property/auto/travel claims).\n\n"
            "Supported formats include PDFs and images (PNG, JPEG)."
        )

    # ── 5. WHERE CAN I TRACK MY CLAIM ──
    if "claim" in msg and any(x in msg for x in ["track", "status", "where", "check", "view"]):
        return (
            "You can track the status of all your submitted claims on the [My Claims](/my-claims) tracking page.\n"
            "It will show you whether your claim is Pending, Approved, or Rejected by the admin."
        )

    # ── 6. HOW DO I FILE A CLAIM / CLAIM WORKFLOW ──
    if "claim" in msg and any(x in msg for x in ["how", "file", "submit", "process", "make", "create", "register", "workflow"]):
        return (
            "To file a claim, please follow these steps using our **Claims** module:\n\n"
            "1. Navigate to the [Claims](/claims) tab in the header.\n"
            "2. **Step 1 (Policy Details)**: Enter your name, policy number, claim type, and claim amount.\n"
            "3. **Step 2 (Incident & Documents)**: Choose the incident date, write a description, and drag-and-drop the required supporting documents (such as ID Proof, Hospital Bills, or incident receipts).\n"
            "4. **Step 3 (Review & Submit)**: Confirm all details are correct and click **Submit Claim**.\n\n"
            "Please note that as a support assistant, I cannot directly submit or process claims for you."
        )

    # ── 7. HOW DOES RECOMMENDATION WORK ──
    if "recommendation" in msg or "recommend" in msg or "match" in msg:
        return (
            "Our recommendation system matches policies based on your **User Preferences**.\n\n"
            "It analyzes the following factors from your profile:\n"
            "- **Age & Health**: Checks if you require senior-specific or general health policies.\n"
            "- **Smoker & Pre-existing conditions**: Identifies risk factors to filter suitable plans.\n"
            "- **Annual Income & Coverage**: Restricts options to what is affordable and provides sufficient cover.\n\n"
            "You can manage your preference details on the [Update Preferences](/preferences) page."
        )

    # ── 8. HOW DOES PREMIUM CALCULATOR WORK / FACTORS ──
    if "calculator" in msg or "calculate" in msg or "premium" in msg:
        return (
            "The **Premium Calculator** estimates your premium based on your selected coverage amount and applies multipliers for risk factors:\n\n"
            "- **Base Rate**: Coverage Amount / 1000\n"
            "- **Age Multiplier**: Up to 30 (1.0x), 31-45 (1.3x), 46-60 (1.8x), 60+ (2.5x)\n"
            "- **Health Condition**: Good (1.0x), Average (1.3x), Poor (1.7x)\n"
            "- **Smoker**: Yes (1.6x), No (1.0x)\n"
            "- **City Type**: Metro (1.2x), Tier-2 (1.1x), Rural (1.0x)\n\n"
            "Try estimating your premiums on the [Premium Calculator](/calculator) page."
        )

    # ── 9. COMPARE POLICIES ──
    if "compare" in msg or "contrast" in msg:
        return (
            "You can compare up to three policies side-by-side on our [Compare Policies](/compare) page.\n"
            "This allows you to contrast premiums, categories, coverage amounts, benefits, and insurer terms."
        )

    # ── 10. FIND A SUITABLE POLICY / BROWSE ──
    if any(x in msg for x in ["find", "search", "browse", "policy", "policies", "plans", "list"]):
        return (
            "To find a suitable policy matched to your needs, please follow these steps:\n\n"
            "1. Update your demographics and health details on the [Update Preferences](/preferences) page.\n"
            "2. Go to the [Recommendations](/recommend) section, where our system will display the health or life insurance plans best suited to your profile.\n"
            "3. You can also manually search all policies in [Browse Policies](/plans)."
        )

    # ── 11. GENERAL FALLBACK ──
    return "I don't have enough information to answer that accurately. Please check the relevant ICRC module or contact the insurer."
