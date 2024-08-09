# from rest_framework import serializers
# from .models import User, Category
#
#
# class UserSerializer(serializers.ModelSerializer):
#     avatar = serializers.SerializerMethodField()
#
#     class Meta:
#         model = User
#         fields = ['id', 'email', 'first_name', 'last_name', 'avatar', 'gender', 'role']
#
#     def get_avatar(self, obj):
#         return obj.get_avatar_url()
#
#
# class CategorySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Category
#         fields = '__all__'