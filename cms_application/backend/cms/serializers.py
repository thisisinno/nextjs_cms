from rest_framework import serializers
from .models import *

class ImageValidationMixin:
    def validate_image(self, image):
        if image and image.size > 3 * 1024 * 1024: raise serializers.ValidationError('Image must be 3MB or smaller.')
        return image
class SiteSettingSerializer(ImageValidationMixin, serializers.ModelSerializer):
    class Meta: model=SiteSetting; fields='__all__'
class HeroSerializer(ImageValidationMixin, serializers.ModelSerializer):
    class Meta: model=HeroSection; fields='__all__'
class AboutSerializer(ImageValidationMixin, serializers.ModelSerializer):
    class Meta: model=AboutSection; fields='__all__'
class InfoCardSerializer(serializers.ModelSerializer):
    class Meta: model=InfoCard; fields='__all__'
class ServiceSerializer(ImageValidationMixin, serializers.ModelSerializer):
    class Meta: model=Service; fields='__all__'
class ProjectImageSerializer(ImageValidationMixin, serializers.ModelSerializer):
    class Meta: model=ProjectImage; fields='__all__'; read_only_fields=['project']
class ProjectSerializer(ImageValidationMixin, serializers.ModelSerializer):
    gallery=ProjectImageSerializer(many=True,read_only=True)
    class Meta: model=Project; fields='__all__'
class StatisticSerializer(serializers.ModelSerializer):
    class Meta: model=Statistic; fields='__all__'
class TeamSerializer(ImageValidationMixin, serializers.ModelSerializer):
    class Meta: model=TeamMember; fields='__all__'
class EnquiryItemSerializer(serializers.ModelSerializer):
    service_title_snapshot=serializers.CharField(read_only=True)
    class Meta: model=EnquiryItem; fields=['id','service','service_title_snapshot','note','quantity']
class EnquirySerializer(serializers.ModelSerializer):
    items=EnquiryItemSerializer(many=True)
    class Meta: model=Enquiry; fields='__all__'; read_only_fields=['status','admin_note','created_at','updated_at']
    def validate_items(self,v):
        if not v: raise serializers.ValidationError('Select at least one service.')
        return v
    def create(self,validated):
        items=validated.pop('items'); enquiry=Enquiry.objects.create(**validated)
        for item in items:
            service=item.get('service'); title=service.title if service else item.get('service_title_snapshot','Service')
            EnquiryItem.objects.create(enquiry=enquiry,service_title_snapshot=title,**item)
        return enquiry
class EnquiryAdminSerializer(serializers.ModelSerializer):
    items=EnquiryItemSerializer(many=True,read_only=True)
    class Meta: model=Enquiry; fields='__all__'
class ContactSerializer(serializers.ModelSerializer):
    class Meta: model=ContactMessage; fields='__all__'; read_only_fields=['status','created_at']
class DashboardSerializer(serializers.Serializer):
    enquiries=serializers.IntegerField(); new_enquiries=serializers.IntegerField(); contact_messages=serializers.IntegerField(); services=serializers.IntegerField(); projects=serializers.IntegerField(); recent_enquiries=EnquiryAdminSerializer(many=True)
