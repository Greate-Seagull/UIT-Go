from rest_framework import serializers
from .models import CustomerUser


class CustomerUserV1Serializers(serializers.ModelSerializer):
    class Meta:
        model = CustomerUser
        fields = ['id', 'username', 'password', 'email', 'birth', 'first_name', 'last_name', 'is_driver', 'is_active', 'phone']
        read_only_fields = ['id']
        extra_kwargs = {'password': {'write_only': True, 'required': False},
                        'email': {'required': False},
                        'username': {'required': False},
                        'first_name': {'required': False},
                        'last_name': {'required': False},
                        'is_driver': {'required': False},
                        'is_active': {'required': False},
                        'phone': {'required' :False}
                       }
        
    def validate(self, attrs):
        if self.instance is None:
            required_fields = ['email', 'password']
            missing = [f for f in required_fields if not self.initial_data.get(f)]
            if missing:
                raise serializers.ValidationError({
                    'missing_fields': f"Các trường bắt buộc khi tạo mới: {', '.join(missing)}"
                })
        return attrs
        
        
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = self.Meta.model(**validated_data)
        if password:
            user.set_password(password)
        else:
            print("No password")
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance