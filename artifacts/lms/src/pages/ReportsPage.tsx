import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BookOpen, Users2, Download, TrendingUp } from 'lucide-react';
import { books, members, downloadLogs } from '@/data/mockData';

const monthlyData = [
  { month: 'Jan', borrowed: 120, returned: 110, downloads: 340 },
  { month: 'Feb', borrowed: 145, returned: 130, downloads: 420 },
  { month: 'Mar', borrowed: 160, returned: 155, downloads: 380 },
  { month: 'Apr', borrowed: 130, returned: 140, downloads: 510 },
  { month: 'May', borrowed: 175, returned: 160, downloads: 460 },
  { month: 'Jun', borrowed: 190, returned: 180, downloads: 520 },
];

const genreData = [
  { name: 'History', value: 25 },
  { name: 'Fiction', value: 20 },
  { name: 'Technology', value: 18 },
  { name: 'Science', value: 15 },
  { name: 'Law', value: 12 },
  { name: 'Others', value: 10 },
];

const COLORS = ['hsl(228,60%,24%)', 'hsl(345,85%,50%)', 'hsl(210,100%,50%)', 'hsl(142,71%,45%)', 'hsl(38,92%,50%)', 'hsl(220,15%,70%)'];

export default function ReportsPage() {
  const totalBooks = books.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const totalDownloads = downloadLogs.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="page-header">Reports & Analytics</h1>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { icon: BookOpen, label: 'Total Books', value: totalBooks.toLocaleString(), color: 'primary' },
            { icon: Users2, label: 'Active Members', value: activeMembers.toLocaleString(), color: 'success' },
            { icon: Download, label: 'Downloads', value: totalDownloads.toLocaleString(), color: 'info' },
            { icon: TrendingUp, label: 'This Month', value: '+15%', color: 'accent' },
          ].map((stat, i) => (
            <Card key={i} className="stat-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}/10 flex items-center justify-center`}>
                  <stat.icon size={20} className={`text-${stat.color}`} />
                </div>
                <div><p className="text-2xl font-bold">{stat.value}</p><p className="text-xs text-muted-foreground">{stat.label}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Monthly Activity</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="borrowed" fill="hsl(228,60%,24%)" radius={[4,4,0,0]} />
                  <Bar dataKey="returned" fill="hsl(142,71%,45%)" radius={[4,4,0,0]} />
                  <Bar dataKey="downloads" fill="hsl(210,100%,50%)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Genre Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={genreData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name} (${value}%)`}>
                    {genreData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
