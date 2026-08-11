import { fetchApi } from "@/services/api/core";

export type EmailType =
  | "OTP"
  | "OTP_VERIFICATION"
  | "RESERVATION_CONFIRMATION"
  | "INVOICE_FOLIO"
  | "PAYMENT_RECEIPT"
  | "STAFF_INVITATION"
  | "LOST_FOUND"
  | "GENERIC";

export interface SendEmailPayload {
  email_type: EmailType;
  recipient_email: string;
  recipient_name?: string;
  subject?: string;
  property_id?: string;
  data?: Record<string, any>;
}

export class MailService {
  /**
   * Primary centralized method to dispatch any type of email from frontend
   */
  static async sendEmail(payload: SendEmailPayload): Promise<{ success: boolean; message: string }> {
    try {
      const activePropertyId = payload.property_id || localStorage.getItem("retrod:active-property-id") || "";
      const bodyPayload = {
        ...payload,
        property_id: activePropertyId,
      };

      const res = await fetchApi<any>("/api/common/send-email/", {
        method: "POST",
        body: JSON.stringify(bodyPayload),
      });

      return {
        success: res?.success ?? true,
        message: res?.message || `Email '${payload.email_type}' sent successfully!`,
      };
    } catch (err: any) {
      console.error("[MailService] Failed to dispatch email:", err);
      return {
        success: false,
        message: err.message || "Failed to send email.",
      };
    }
  }

  /**
   * Send 6-digit OTP verification code email
   */
  static async sendOtp(email: string, otpCode: string, recipientName?: string) {
    return this.sendEmail({
      email_type: "OTP_VERIFICATION",
      recipient_email: email,
      recipient_name: recipientName,
      data: { otp_code: otpCode, expiry_minutes: 5 },
    });
  }

  /**
   * Send Reservation Booking Confirmation email
   */
  static async sendReservationConfirmation(
    email: string,
    recipientName: string,
    reservationData: {
      reservation_id: string;
      check_in: string;
      check_out: string;
      room_name: string;
      guests?: string;
      total_amount: string | number;
    }
  ) {
    return this.sendEmail({
      email_type: "RESERVATION_CONFIRMATION",
      recipient_email: email,
      recipient_name: recipientName,
      data: reservationData,
    });
  }

  /**
   * Send GST Tax Invoice / Guest Folio email
   */
  static async sendInvoice(
    email: string,
    recipientName: string,
    invoiceData: {
      invoice_no: string;
      date?: string;
      room_number?: string;
      subtotal: string | number;
      tax_amount: string | number;
      grand_total: string | number;
      line_items?: Array<{ description: string; amount: string | number }>;
    }
  ) {
    return this.sendEmail({
      email_type: "INVOICE_FOLIO",
      recipient_email: email,
      recipient_name: recipientName,
      data: invoiceData,
    });
  }

  /**
   * Send Payment Receipt email
   */
  static async sendPaymentReceipt(
    email: string,
    recipientName: string,
    paymentData: {
      txn_id: string;
      method: string;
      amount: string | number;
      date?: string;
    }
  ) {
    return this.sendEmail({
      email_type: "PAYMENT_RECEIPT",
      recipient_email: email,
      recipient_name: recipientName,
      data: paymentData,
    });
  }

  /**
   * Send Staff Invitation email
   */
  static async sendStaffInvite(
    email: string,
    recipientName: string,
    roleName: string,
    inviteLink?: string
  ) {
    return this.sendEmail({
      email_type: "STAFF_INVITATION",
      recipient_email: email,
      recipient_name: recipientName,
      data: { role_name: roleName, invite_link: inviteLink || (typeof window !== "undefined" ? window.location.origin + "/login" : "") },
    });
  }
}
