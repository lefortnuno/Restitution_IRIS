from rest_framework import serializers

from django.contrib.auth import get_user_model 

User = get_user_model()

class AddUserSerializer(serializers.ModelSerializer):  
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs ={
            'password':{'write_only': True}
        }

    def create(self, validated_data):
        user = User(
            email=validated_data["email"],
            username=validated_data["username"],
            first_name=validated_data["first_name"]
        )
        user.set_password(validated_data["password"])
        user.save()
        return user 

class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "username", "first_name", "bio", "facebook"] 

class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name"]
 