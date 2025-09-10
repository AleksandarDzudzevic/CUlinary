import { supabase } from '../lib/supabase';

export class DatabaseManager {
  /**
   * Clean up old menu data (older than current date)
   */
  static async cleanupOldMenus(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      console.log(`🧹 Cleaning up menus older than ${today}`);
      
      const { data, error } = await supabase
        .from('menus')
        .delete()
        .lt('menu_date', today);
      
      if (error) {
        console.error('❌ Error cleaning up old menus:', error);
        return;
      }
      
      console.log('✅ Old menus cleaned up successfully');
    } catch (error) {
      console.error('❌ Error in cleanup process:', error);
    }
  }

  /**
   * Check if we need to fetch fresh menu data
   * Returns true if we should fetch from API, false if DB data is sufficient
   */
  static async shouldFetchFromAPI(): Promise<boolean> {
    try {
      // Get the latest menu update timestamp from any menu
      const { data: latestMenu, error } = await supabase
        .from('menus')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ Error checking menu timestamps:', error);
        return true; // Fetch from API on error
      }

      if (!latestMenu || latestMenu.length === 0) {
        console.log('📭 No menus in database, fetching from API');
        return true; // No menus exist, fetch from API
      }

      const lastUpdate = new Date(latestMenu[0].updated_at);
      const now = new Date();
      const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

      // Fetch from API if data is older than 6 hours
      if (hoursSinceUpdate > 6) {
        console.log(`⏰ Last update was ${Math.round(hoursSinceUpdate)} hours ago, fetching fresh data`);
        return true;
      }

      console.log(`✅ Menu data is fresh (${Math.round(hoursSinceUpdate)} hours old), using database`);
      return false;
    } catch (error) {
      console.error('❌ Error checking if API fetch needed:', error);
      return true; // Fetch from API on error
    }
  }

  /**
   * Get menu count for today and future dates
   */
  static async getMenuStats(): Promise<{ total: number; todayAndFuture: number }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Total menus
      const { count: totalCount, error: totalError } = await supabase
        .from('menus')
        .select('*', { count: 'exact', head: true });

      // Future menus (today and later)
      const { count: futureCount, error: futureError } = await supabase
        .from('menus')
        .select('*', { count: 'exact', head: true })
        .gte('menu_date', today);

      if (totalError || futureError) {
        console.error('❌ Error getting menu stats:', totalError || futureError);
        return { total: 0, todayAndFuture: 0 };
      }

      return {
        total: totalCount || 0,
        todayAndFuture: futureCount || 0
      };
    } catch (error) {
      console.error('❌ Error getting menu stats:', error);
      return { total: 0, todayAndFuture: 0 };
    }
  }

  /**
   * Initialize database maintenance (cleanup old data)
   */
  static async initializeMaintenance(): Promise<void> {
    console.log('🔧 Initializing database maintenance...');
    
    // Clean up old menus
    await this.cleanupOldMenus();
    
    // Log current stats
    const stats = await this.getMenuStats();
    console.log(`📊 Database stats: ${stats.total} total menus, ${stats.todayAndFuture} current/future menus`);
  }

  /**
   * Force cleanup of old data (can be called manually)
   */
  static async forceCleanup(): Promise<void> {
    console.log('🧹 Force cleaning database...');
    await this.cleanupOldMenus();
    const stats = await this.getMenuStats();
    console.log(`📊 After cleanup: ${stats.total} total menus, ${stats.todayAndFuture} current/future menus`);
  }
}
