from django.core.management.base import BaseCommand

from cms.models import AboutSection


def flatten(value):
    if isinstance(value, list):
        out = []
        for item in value:
            out.extend(flatten(item))
        return out
    if value in (None, ''):
        return []
    return [str(value).strip()] if str(value).strip() else []


class Command(BaseCommand):
    help = 'Normalize AboutSection bullet_points into a clean list of strings.'

    def handle(self, *args, **kwargs):
        count = 0
        for about in AboutSection.objects.all():
            cleaned = flatten(about.bullet_points)
            if cleaned != about.bullet_points:
                about.bullet_points = cleaned
                about.save(update_fields=['bullet_points'])
                count += 1
        self.stdout.write(self.style.SUCCESS(f'Cleaned {count} AboutSection rows.'))
