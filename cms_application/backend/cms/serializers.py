from rest_framework import serializers
from .models import *

class FlexibleStringListField(serializers.Field):
    default_error_messages = {
        'invalid': 'Write one bullet point per line.',
    }

    def to_representation(self, value):
        if value in (None, ''):
            return []

        if isinstance(value, list):
            return [str(item).strip() for item in self._flatten(value) if str(item).strip()]

        if isinstance(value, str):
            return self._parse_string(value)

        return [str(value).strip()] if str(value).strip() else []

    def to_internal_value(self, data):
        if data in (None, ''):
            return []

        if isinstance(data, list):
            values = []
            for item in self._flatten(data):
                if isinstance(item, str):
                    values.extend(self._parse_string(item))
                elif item is not None:
                    values.append(str(item).strip())
            return [item for item in values if item]

        if isinstance(data, str):
            return self._parse_string(data)

        return [str(data).strip()] if str(data).strip() else []

    def _flatten(self, value):
        for item in value:
            if isinstance(item, list):
                yield from self._flatten(item)
            else:
                yield item

    def _parse_string(self, text):
        import json

        text = str(text).strip()
        if not text:
            return []

        try:
            parsed = json.loads(text)
            if isinstance(parsed, list):
                return [
                    str(item).strip()
                    for item in self._flatten(parsed)
                    if str(item).strip()
                ]
        except Exception:
            pass

        return [
            item.strip()
            for item in text.replace(',', '\n').splitlines()
            if item.strip()
        ]

class ImageValidationMixin:
    def validate_image(self, image):
        if image and image.size > 3 * 1024 * 1024: raise serializers.ValidationError('Image must be 3MB or smaller.')
        return image
class SiteSettingSerializer(ImageValidationMixin, serializers.ModelSerializer):
    class Meta: model=SiteSetting; fields='__all__'
class HeroSerializer(ImageValidationMixin, serializers.ModelSerializer):
    class Meta: model=HeroSection; fields='__all__'
class AboutSerializer(ImageValidationMixin, serializers.ModelSerializer):
    bullet_points = FlexibleStringListField(required=False)

    def validate_bullet_points(self, value):
        return [str(item).strip() for item in value if str(item).strip()]

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
    service=serializers.PrimaryKeyRelatedField(queryset=Service.objects.all(),required=False,allow_null=True,error_messages={'does_not_exist':'One selected service is no longer available. Please remove it and select again.','incorrect_type':'One selected service is no longer available. Please remove it and select again.'})
    service_title_snapshot=serializers.CharField(required=False,allow_blank=True)
    note=serializers.CharField(required=False,allow_blank=True)
    quantity=serializers.IntegerField(required=False,min_value=1,default=1)
    class Meta: model=EnquiryItem; fields=['id','service','service_title_snapshot','note','quantity']
class EnquirySerializer(serializers.ModelSerializer):
    full_name=serializers.CharField(required=True,error_messages={'blank':'Please enter your full name.','required':'Please enter your full name.'})
    phone=serializers.CharField(required=True,error_messages={'blank':'Please enter your phone number.','required':'Please enter your phone number.'})
    location=serializers.CharField(required=True,error_messages={'blank':'Please enter your project location.','required':'Please enter your project location.'})
    items=EnquiryItemSerializer(many=True)
    class Meta: model=Enquiry; fields='__all__'; read_only_fields=['status','admin_note','created_at','updated_at']
    def validate_items(self,v):
        if not v: raise serializers.ValidationError('Select at least one service.')
        for item in v:
            if not item.get('service') and not str(item.get('service_title_snapshot','')).strip():
                raise serializers.ValidationError('Each enquiry item must include a service or service name.')
        return v
    def create(self,validated):
        items=validated.pop('items'); enquiry=Enquiry.objects.create(**validated)
        for item in items:
            service=item.get('service'); snapshot=str(item.get('service_title_snapshot','')).strip()
            if service: snapshot=service.title
            if not snapshot: snapshot='Requested service'
            EnquiryItem.objects.create(enquiry=enquiry,service=service,service_title_snapshot=snapshot,note=item.get('note',''),quantity=item.get('quantity',1) or 1)
        return enquiry
class EnquiryAdminSerializer(serializers.ModelSerializer):
    items=EnquiryItemSerializer(many=True,read_only=True)
    class Meta: model=Enquiry; fields='__all__'
class ContactSerializer(serializers.ModelSerializer):
    class Meta: model=ContactMessage; fields='__all__'; read_only_fields=['status','created_at']
class DashboardSerializer(serializers.Serializer):
    enquiries=serializers.IntegerField(); new_enquiries=serializers.IntegerField(); contact_messages=serializers.IntegerField(); services=serializers.IntegerField(); projects=serializers.IntegerField(); recent_enquiries=EnquiryAdminSerializer(many=True)
