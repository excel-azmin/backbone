import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { CreateNotificationDto } from 'src/common/dto/create-notifications.dto';
import {
  Notification,
  NotificationType,
} from 'src/common/entity/notification.entity';

@Injectable()
export class EmailNotificationService {
  constructor(
    private readonly mailService: MailerService,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  async sendMail(sendMailDto: CreateNotificationDto) {
    try {
      const { mailTemplate, email, title, message } = sendMailDto;
      if (!mailTemplate) {
        throw new InternalServerErrorException('Mail template is missing.');
      }
      if (!email || email.length === 0) {
        throw new InternalServerErrorException('Recipient email is missing.');
      }
      const isMailEnabled = await this.isMailEnabled();
      if (!isMailEnabled) {
        return {
          status: false,
          message: 'Mail notifications are disabled in the settings.',
        };
      }

      const emailContext = this.getEmailContext(mailTemplate, sendMailDto);
      const result = await this.mailService.sendMail({
        to: email[0],
        subject: title,
        template: mailTemplate,
        context: emailContext,
      });
      const newNotification = await this.notificationModel.create({
        senderId: sendMailDto.senderId || null,
        fullName: sendMailDto.fullName,
        title,
        message,
        email,
        data: sendMailDto.data,
        notificationType: NotificationType.EMAIL,
        emailNotificationResult: { status: true, response: result },
        isRead: false,
      });

      return {
        status: true,
        response: result,
        message: 'Email sent & saved successfully',
        notification: newNotification,
      };
    } catch (error) {
      console.error('Error Sending Email:', error?.message || error);
      throw new InternalServerErrorException(
        `Failed to send email: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  async sendBulkMail(sendMailDto: CreateNotificationDto) {
    try {
      if (!sendMailDto.email || sendMailDto.email.length === 0) {
        throw new InternalServerErrorException('Email list is empty.');
      }

      const emailList = sendMailDto.email;
      const emailSendResults = await Promise.allSettled(
        emailList.map(async (recipientEmail) => {
          try {
            const result = await this.sendMail({
              ...sendMailDto,
              email: [recipientEmail],
            });
            return { email: recipientEmail, status: true, response: result };
          } catch (error) {
            return {
              email: recipientEmail,
              status: false,
              reason: error?.message || 'Unknown error',
            };
          }
        }),
      );

      return emailSendResults.map((res) => ({
        email: res.status === 'fulfilled' ? res.value.email : res.reason.email,
        status: res.status === 'fulfilled',
        reason: res.status === 'rejected' ? res.reason.reason : null,
        response: res.status === 'fulfilled' ? res.value.response : null,
      }));
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to send bulk email: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  private async isMailEnabled() {
    const collection = this.connection.collection('settings');
    if (collection) {
      return await collection
        .findOne({})
        .then((settings) => settings?.isMailEnabled);
    }
    return false;
  }

  private getEmailContext(
    mailTemplate: string,
    sendMailDto: CreateNotificationDto,
  ) {
    // Use a flexible object type for commonContext
    const commonContext: Record<string, any> = {
      fullName: sendMailDto.fullName || 'User',
      message: sendMailDto.message || '',
    };

    const templateContextMap: Record<string, any> = {
      default: {
        email: sendMailDto.email || '',
        title: sendMailDto.title || '',
        message: sendMailDto.message || '',
      },
      'registration-verification': {
        fullName: sendMailDto.fullName || 'User',
        data: sendMailDto.data || {},
        year: new Date().getFullYear(),
      },
      'reset-password': {
        fullName: sendMailDto.fullName || 'User',
        email: sendMailDto.data?.email || '',
        mobile: sendMailDto.data?.mobile || '',
        jobLocation: sendMailDto.data?.jobLocation || '',
        message: sendMailDto.message || '',
      },
      'order-submitted': {
        supervisorName: sendMailDto.data?.supervisorName || 'Supervisor',
        userName: sendMailDto.fullName || 'User',
        orderNo: sendMailDto.data?.orderNo || '',
        totalAmount: sendMailDto.data?.totalAmount || '',
        customerName: sendMailDto.data?.customerName || '',
      },
      'order-status-updated': {
        salesPersonName: sendMailDto.data?.salesPersonName || 'Sales Person',
        sinvNo: sendMailDto.data?.sinvNo || '',
        orderNo: sendMailDto.data?.orderNo || '',
        totalAmount: sendMailDto.data?.totalAmount || '',
        customerName: sendMailDto.data?.customerName || '',
        orderStatus: sendMailDto.data?.orderStatus || '',
      },
      'cheque-notify': {
        salesPersons:
          sendMailDto.data?.[0]?.excel_sales_person_name || 'Sales Person',
        chequeTables: Array.isArray(sendMailDto.data)
          ? this.generateChequeTables(sendMailDto.data)
          : '',
      },
      'collection-notify': {
        salesPersonName:
          sendMailDto.data?.[0]?.excel_sales_person_name || 'Sales Person',
        collectionTable: Array.isArray(sendMailDto.data)
          ? this.generateCollectionTable(sendMailDto.data)
          : '',
      },
      'team-notify': {
        salesPersonName: sendMailDto.data?.salesPersonName || 'Sales Person',
        senderName: sendMailDto.data?.senderName || 'Supervisor',
      },
      'todays-scheduled-plan': {
        // Add today's schedule if it exists
        ...(sendMailDto.data?.todaysPlan?.length > 0 && {
          todaysScheduledPlan: `
          <p><strong>Today's schedule:</strong></p>
          ${this.generateScheduledPlanTable(sendMailDto.data?.todaysPlan)}
        `,
        }),

        // Add missed schedule if it exists
        ...(sendMailDto.data?.missedPlan?.length > 0 && {
          missedScheduledPlan: `
          <p><strong>Yesterday's missed schedule:</strong></p>
          ${this.generateScheduledPlanTable(sendMailDto.data?.missedPlan)}
        `,
        }),
      },
    };

    // Ensure if only one schedule is available, the other one still gets added
    if (
      sendMailDto.data?.todaysPlan?.length > 0 &&
      sendMailDto.data?.missedPlan?.length === 0
    ) {
      commonContext.todaysScheduledPlan = `
      <p><strong>Today's schedule:</strong></p>
      ${this.generateScheduledPlanTable(sendMailDto.data?.todaysPlan)}
    `;
    }

    if (
      sendMailDto.data?.missedPlan?.length > 0 &&
      sendMailDto.data?.todaysPlan?.length === 0
    ) {
      commonContext.missedScheduledPlan = `
      <p><strong>Yesterday's missed schedule:</strong></p>
      ${this.generateScheduledPlanTable(sendMailDto.data?.missedPlan)}
    `;
    }

    // Return the final merged context
    return { ...commonContext, ...(templateContextMap[mailTemplate] || {}) };
  }

  private generateChequeTables(chequeData: any[]) {
    if (!chequeData || chequeData.length === 0) {
      return '<p>No collections recorded for today.</p>';
    }

    let tableHtml = `
      <table style="width: 100%; border-collapse: collapse;">
          <tr>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">SL</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Customer Name</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Voucher No.</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Amount</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Sales Person</th>
          </tr>`;

    tableHtml += chequeData
      .map(
        (entry, index) => `
      <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}.</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${entry.customer_name}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${entry.name}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${entry.paid_amount.toLocaleString()} BDT</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${entry.excel_sales_person_name}</td>
      </tr>`,
      )
      .join('');

    tableHtml += `</table>`;

    return tableHtml;
  }

  private generateCollectionTable(collectionData: any[]) {
    if (!collectionData || collectionData.length === 0) {
      return '<p>No collections recorded for today.</p>';
    }

    let tableHtml = `
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">SL</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Customer Name</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Voucher No.</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Amount</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Sales Person</th>
            </tr>`;

    tableHtml += collectionData
      .map(
        (entry, index) => `
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}.</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${entry.customer_name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${entry.name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${entry.paid_amount.toLocaleString()} BDT</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${entry.excel_sales_person_name}</td>
        </tr>`,
      )
      .join('');

    tableHtml += `</table>`;

    return tableHtml;
  }

  private generateScheduledPlanTable(planData: any[]) {
    if (!planData || planData.length === 0) {
      return `<p>No recorded for today.</p>`;
    }

    let tableHtml = `
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 40px;">SL</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Customer Name</th>
            </tr>`;

    tableHtml += planData
      .map(
        (entry, index) => `
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}.</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${entry.customerName}</td>
        </tr>`,
      )
      .join('');

    tableHtml += `</table>`;
    return tableHtml;
  }
}
