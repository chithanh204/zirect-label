'use client';

import { Card } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertCircle, Music, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const albumProcesses = [
  {
    id: 1,
    title: 'Midnight Dreams',
    ucp: 'UCP-2024-001',
    artist: 'Luna Echo',
    steps: [
      { step: 'Submit', status: 'completed', date: '2024-03-10' },
      { step: 'Making Cover Art', status: 'completed', date: '2024-03-11' },
      { step: 'Approved', status: 'completed', date: '2024-03-13' },
      { step: 'Distributed', status: 'completed', date: '2024-03-15' }
    ]
  },
  {
    id: 2,
    title: 'Summer Collection',
    ucp: 'UCP-2024-003',
    artist: 'Tropical Waves',
    steps: [
      { step: 'Submit', status: 'completed', date: '2024-03-15' },
      { step: 'Making Cover Art', status: 'in_progress', date: null },
      { step: 'Approved', status: 'pending', date: null },
      { step: 'Distributed', status: 'pending', date: null }
    ]
  },
  {
    id: 3,
    title: 'Night Vibes',
    ucp: 'UCP-2024-005',
    artist: 'Luna Echo',
    steps: [
      { step: 'Submit', status: 'completed', date: '2024-03-18' },
      { step: 'Making Cover Art', status: 'completed', date: '2024-03-19' },
      { step: 'Approved', status: 'rejected', date: '2024-03-20' },
      { step: 'Distributed', status: 'pending', date: null }
    ]
  }
];

export function ProcessTracker() {
  return (
    <div className="space-y-6">
      {albumProcesses.map((album) => (
        <Card key={album.id} className="glass-card p-6">
          <div className="mb-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold">{album.title}</h3>
                <p className="text-sm text-muted-foreground">{album.artist}</p>
              </div>
              <span className="font-mono text-sm text-accent">{album.ucp}</span>
            </div>
          </div>

          {/* Process Steps */}
          <div className="space-y-4">
            {album.steps.map((item, idx) => {
              const isLast = idx === album.steps.length - 1;
              const statusConfig = {
                completed: { icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
                in_progress: { icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
                pending: { icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-muted/10' },
                rejected: { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' }
              };

              const config = statusConfig[item.status as keyof typeof statusConfig];
              const Icon = config.icon;

              return (
                <div key={idx}>
                  <div className="flex items-start gap-4">
                    {/* Timeline Indicator */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-12 ${item.status === 'completed' ? 'bg-green-500' : 'bg-muted'
                          }`} />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold">{item.step}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                            item.status === 'in_progress' ? 'bg-blue-500/20 text-blue-500' :
                              item.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                                'bg-muted/50 text-muted-foreground'
                          }`}>
                          {item.status === 'in_progress' ? 'IN PROGRESS' :
                            item.status === 'completed' ? 'COMPLETED' :
                              item.status === 'rejected' ? 'REJECTED' :
                                'PENDING'}
                        </span>
                      </div>
                      {item.date && (
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button variant="outline" size="sm">
              <Music className="w-4 h-4 mr-2" />
              View Album
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
