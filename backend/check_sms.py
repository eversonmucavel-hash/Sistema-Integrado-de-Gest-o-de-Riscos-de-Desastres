from notifications.models import NotificacaoSMS
from django.db.models import Count

print('Total:', NotificacaoSMS.objects.count())
print()
print('Por status:')
for s in NotificacaoSMS.objects.values('status').annotate(t=Count('id')).order_by('-t'):
    print(f"  {s['status']}: {s['t']}")