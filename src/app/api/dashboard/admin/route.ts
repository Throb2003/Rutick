import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
import Transaction from '@/models/Transaction';
import { authenticateToken, requireRole } from '@/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    const authError = await authenticateToken(req);
    if (authError) return authError;

    const roleError = requireRole(['admin'])(req);
    if (roleError) return roleError;

    await connectDB();

    // Get platform-wide statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalEvents = await Event.countDocuments();
    const publishedEvents = await Event.countDocuments({ status: 'published' });
    const totalTickets = await Ticket.countDocuments();
    const usedTickets = await Ticket.countDocuments({ status: 'used' });

    // Get user statistics by role
    const usersByRole = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get transaction statistics
    const totalRevenue = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get event statistics by category
    const eventsByCategory = await Event.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get monthly revenue trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          paymentDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get top events by revenue
    const topEvents = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      {
        $lookup: {
          from: 'tickets',
          localField: 'tickets',
          foreignField: '_id',
          as: 'ticketDocs'
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: 'ticketDocs.event',
          foreignField: '_id',
          as: 'eventDocs'
        }
      },
      { $unwind: '$eventDocs' },
      {
        $group: {
          _id: '$eventDocs._id',
          title: { $first: '$eventDocs.title' },
          totalRevenue: { $sum: '$amount' },
          ticketsSold: { $sum: { $size: '$tickets' } }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // Get recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    const recentEvents = await Event.find()
      .populate('organizer', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentTransactions = await Transaction.find()
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get analytics data
    const analytics = {
      userGrowth: await getUserGrowth(),
      eventCategories: eventsByCategory,
      revenueTrend: monthlyRevenue,
      topPerformingEvents: topEvents
    };

    return NextResponse.json({
      success: true,
      dashboard: {
        overview: {
          totalUsers,
          totalEvents,
          publishedEvents,
          totalTickets,
          usedTickets,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        usersByRole,
        recentActivity: {
          recentUsers,
          recentEvents,
          recentTransactions
        },
        analytics
      }
    });

  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getUserGrowth() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyGrowth = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  return dailyGrowth;
}