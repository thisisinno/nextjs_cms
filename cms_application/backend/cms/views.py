from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Q
from rest_framework import permissions, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import *
from .serializers import *

class StaffWrite(permissions.BasePermission):
    def has_permission(self, request, view): return request.method in permissions.SAFE_METHODS or bool(request.user and request.user.is_staff)
class PublicActive(viewsets.ReadOnlyModelViewSet):
    permission_classes=[permissions.AllowAny]
    def get_queryset(self): return self.queryset.filter(is_active=True)
class ServiceViewSet(PublicActive):
    queryset=Service.objects.all(); serializer_class=ServiceSerializer; lookup_field='slug'
class ProjectViewSet(PublicActive):
    queryset=Project.objects.all(); serializer_class=ProjectSerializer; lookup_field='slug'
    def get_queryset(self):
        qs=super().get_queryset(); category=self.request.query_params.get('category')
        return qs.filter(Q(category=category)|Q(is_featured=True)) if category=='featured' else qs.filter(category=category) if category else qs
class TeamViewSet(PublicActive): queryset=TeamMember.objects.all(); serializer_class=TeamSerializer
class EnquiryViewSet(viewsets.ModelViewSet):
    queryset=Enquiry.objects.prefetch_related('items').all(); serializer_class=EnquiryAdminSerializer
    def get_permissions(self): return [permissions.AllowAny()] if self.action=='create' else [permissions.IsAdminUser()]
    def get_serializer_class(self): return EnquirySerializer if self.action=='create' else EnquiryAdminSerializer
    def perform_create(self, serializer):
        enquiry=serializer.save()
        recipient=settings.ADMIN_NOTIFICATION_EMAIL
        if recipient:
            try: send_mail(f'New enquiry: {enquiry.full_name}', f'Phone: {enquiry.phone}\nLocation: {enquiry.location}\nServices: '+', '.join(i.service_title_snapshot for i in enquiry.items.all()), settings.DEFAULT_FROM_EMAIL,[recipient],fail_silently=True)
            except Exception: pass
class ContactViewSet(viewsets.ModelViewSet):
    queryset=ContactMessage.objects.all(); serializer_class=ContactSerializer
    def get_permissions(self): return [permissions.AllowAny()] if self.action=='create' else [permissions.IsAdminUser()]
class AdminModelViewSet(viewsets.ModelViewSet): permission_classes=[permissions.IsAdminUser]
class AdminServiceViewSet(AdminModelViewSet): queryset=Service.objects.all(); serializer_class=ServiceSerializer
class AdminProjectViewSet(AdminModelViewSet): queryset=Project.objects.all(); serializer_class=ProjectSerializer
class AdminHeroViewSet(AdminModelViewSet): queryset=HeroSection.objects.all(); serializer_class=HeroSerializer
class AdminAboutViewSet(AdminModelViewSet): queryset=AboutSection.objects.all(); serializer_class=AboutSerializer
class AdminInfoViewSet(AdminModelViewSet): queryset=InfoCard.objects.all(); serializer_class=InfoCardSerializer
class AdminTeamViewSet(AdminModelViewSet): queryset=TeamMember.objects.all(); serializer_class=TeamSerializer
class AdminStatsViewSet(AdminModelViewSet): queryset=Statistic.objects.all(); serializer_class=StatisticSerializer
@api_view(['GET','PUT','PATCH'])
@permission_classes([permissions.IsAdminUser])
def admin_settings(request):
    obj=SiteSetting.objects.first()
    if not obj: obj=SiteSetting.objects.create(primary_phone='',email='',location='')
    serializer=SiteSettingSerializer(obj,data=request.data,partial=request.method=='PATCH')
    if request.method=='GET': return Response(SiteSettingSerializer(obj,context={'request':request}).data)
    serializer.is_valid(raise_exception=True); serializer.save(); return Response(serializer.data)
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def home(request):
    setting=SiteSetting.objects.first(); hero=HeroSection.objects.filter(is_active=True).first(); about=AboutSection.objects.filter(is_active=True).first()
    return Response({'site_settings':SiteSettingSerializer(setting,context={'request':request}).data if setting else None,'hero':HeroSerializer(hero,context={'request':request}).data if hero else None,'about':AboutSerializer(about,context={'request':request}).data if about else None,'info_cards':InfoCardSerializer(InfoCard.objects.filter(is_active=True),many=True).data,'featured_services':ServiceSerializer(Service.objects.filter(is_active=True)[:6],many=True,context={'request':request}).data,'featured_projects':ProjectSerializer(Project.objects.filter(is_active=True).filter(Q(is_featured=True)|Q(category='featured'))[:6],many=True,context={'request':request}).data,'stats':StatisticSerializer(Statistic.objects.filter(is_active=True),many=True).data,'team':TeamSerializer(TeamMember.objects.filter(is_active=True)[:6],many=True,context={'request':request}).data})
@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def dashboard(request):
    return Response(DashboardSerializer({'enquiries':Enquiry.objects.count(),'new_enquiries':Enquiry.objects.filter(status='new').count(),'contact_messages':ContactMessage.objects.count(),'services':Service.objects.count(),'projects':Project.objects.count(),'recent_enquiries':Enquiry.objects.prefetch_related('items')[:8]}).data)
