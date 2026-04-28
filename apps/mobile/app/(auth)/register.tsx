import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { signUpWithEmail, signInWithGoogle } from "../../services/auth";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password || !passwordConfirm) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await signUpWithEmail(email, password, name);
      
      // Eğer bir oturum dönmediyse, e-posta doğrulaması gerekebilir
      if (!data?.session) {
        setError("Kayıt başarılı! Lütfen e-posta adresinizi onaylayarak giriş yapın.");
        setLoading(false);
      } else {
        // Başarılıysa ve oturum varsa _layout dosyası bizi onboarding'e yönlendirecek
      }
    } catch (err: any) {
      setError(err.message || "Kayıt sırasında bir hata oluştu.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError("Google ile giriş yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12 pt-16">
          
          <TouchableOpacity onPress={() => router.back()} className="absolute top-12 left-6 z-10 w-10 h-10 items-center justify-center bg-white rounded-full border border-border">
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          {/* Header */}
          <View className="mb-8 pl-2">
            <Text className="text-3xl font-bold text-text-primary">Yeni Hesap Oluştur</Text>
            <Text className="text-base text-text-secondary mt-2">
              Bilgilerini gir ve hedeflerine ulaşmaya başla.
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4 mb-6">
            <View>
              <Text className="text-sm font-medium text-text-primary mb-1 ml-1">Ad Soyad</Text>
              <View className="flex-row items-center bg-white rounded-button border border-border focus:border-primary px-4 h-14">
                <Ionicons name="person-outline" size={20} color="#9E9E9E" />
                <TextInput
                  className="flex-1 ml-3 text-base text-text-primary outline-none"
                  placeholder="Ad Soyad"
                  placeholderTextColor="#9E9E9E"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-text-primary mb-1 ml-1 mt-4">E-posta</Text>
              <View className="flex-row items-center bg-white rounded-button border border-border focus:border-primary px-4 h-14">
                <Ionicons name="mail-outline" size={20} color="#9E9E9E" />
                <TextInput
                  className="flex-1 ml-3 text-base text-text-primary outline-none"
                  placeholder="ornek@email.com"
                  placeholderTextColor="#9E9E9E"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-text-primary mb-1 ml-1 mt-4">Şifre</Text>
              <View className="flex-row items-center bg-white rounded-button border border-border focus:border-primary px-4 h-14">
                <Ionicons name="lock-closed-outline" size={20} color="#9E9E9E" />
                <TextInput
                  className="flex-1 ml-3 text-base text-text-primary outline-none"
                  placeholder="En az 6 karakter"
                  placeholderTextColor="#9E9E9E"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#9E9E9E"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-text-primary mb-1 ml-1 mt-4">Şifre Tekrar</Text>
              <View className="flex-row items-center bg-white rounded-button border border-border focus:border-primary px-4 h-14">
                <Ionicons name="lock-closed-outline" size={20} color="#9E9E9E" />
                <TextInput
                  className="flex-1 ml-3 text-base text-text-primary outline-none"
                  placeholder="Şifreni onayla"
                  placeholderTextColor="#9E9E9E"
                  secureTextEntry={!showPassword}
                  value={passwordConfirm}
                  onChangeText={setPasswordConfirm}
                />
              </View>
            </View>

            {error ? <Text className="text-error text-sm ml-1 mt-2">{error}</Text> : null}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className={`h-14 rounded-button items-center justify-center mb-6 mt-4 ${
              loading ? "bg-primary-light" : "bg-primary"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">Kayıt Ol</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[1px] bg-border" />
            <Text className="text-text-hint px-4 font-medium">veya</Text>
            <View className="flex-1 h-[1px] bg-border" />
          </View>

          {/* Google Button */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            disabled={loading}
            className="flex-row h-14 bg-white rounded-button border border-border items-center justify-center mb-8"
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" className="mr-3" />
            <Text className="text-text-primary text-base font-semibold ml-2">
              Google ile Kayıt Ol
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center mt-auto pb-4">
            <Text className="text-text-secondary">Zaten hesabın var mı? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-bold">Giriş Yap</Text>
              </TouchableOpacity>
            </Link>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
