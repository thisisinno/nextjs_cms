from django.urls import include,path
from rest_framework.routers import DefaultRouter
from .views import *
router=DefaultRouter()
router.register('services',ServiceViewSet,basename='services'); router.register('projects',ProjectViewSet,basename='projects'); router.register('team',TeamViewSet,basename='team'); router.register('enquiries',EnquiryViewSet,basename='enquiries'); router.register('contact-messages',ContactViewSet,basename='contact')
admin_router=DefaultRouter(); admin_router.register('services',AdminServiceViewSet); admin_router.register('projects',AdminProjectViewSet); admin_router.register('hero',AdminHeroViewSet); admin_router.register('about',AdminAboutViewSet); admin_router.register('info-cards',AdminInfoViewSet); admin_router.register('team',AdminTeamViewSet); admin_router.register('statistics',AdminStatsViewSet)
urlpatterns=[path('',include(router.urls)),path('home/',home),path('site-settings/',site_settings),path('admin/',include(admin_router.urls)),path('admin/settings/',admin_settings),path('admin/settings/<int:pk>/',admin_settings),path('admin/dashboard/',dashboard),path('admin/translate/',admin_translate)]
