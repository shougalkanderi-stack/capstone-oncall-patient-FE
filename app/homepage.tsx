import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { getMyAppointments } from "../api/appointments";
import { getMyProfile } from "../api/auth";
import { AppColors } from "../constants/Colors";

type ActiveTab = "home" | "appointments" | "messages" | "profile";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [activeButton, setActiveButton] = useState<'book' | 'previous'>('book');

  // ✅ Fetch patient's appointments
  const {
    data: appointments = [],
    isLoading: isAppointmentsLoading,
    isError: isAppointmentsError,
    error: appointmentsError,
    refetch: refetchAppointments,
  } = useQuery({
    queryKey: ["appointments"],
    queryFn: getMyAppointments,
    retry: 2,
    retryDelay: 1000,
  });

  // ✅ Fetch logged-in patient
  const {
    data: data,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
    retry: 2,
    retryDelay: 1000,
  });
  console.log("profile", data);
  const handleTabPress = (tab: ActiveTab) => {
    setActiveTab(tab);
    switch (tab) {
      case "appointments":
        router.push("/appointments");
        break;
      case "messages":
        router.push("/messages");
        break;
      case "profile":
        router.push("/profile");
        break;
    }
  };

  const handleRetry = () => {
    if (isProfileError) refetchProfile();
    if (isAppointmentsError) refetchAppointments();
  };

  const today = new Date().toISOString().split('T')[0];
  // Group appointments by date
  const markedDates = appointments.reduce((acc: any, appt: any) => {
    const isUpcoming = new Date(appt.date) >= new Date(today);
    acc[appt.date] = acc[appt.date] || { dots: [] };
    acc[appt.date].dots.push({
      key: appt._id,
      color: isUpcoming ? '#568065' : '#b7e2c7',
      selectedDotColor: isUpcoming ? '#568065' : '#b7e2c7',
    });
    return acc;
  }, {});
  // Filter today's upcoming appointments
  const todaysAppointments = appointments.filter(
    (appt: any) => appt.date === today && new Date(appt.date) >= new Date(today)
  );

  const renderContent = () => (
    <ScrollView contentContainerStyle={styles.content}>
      {/* 👋 Patient Info */}
      {isProfileLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : isProfileError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <Text style={styles.errorDetails}>{profileError?.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.welcomeCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.welcomeText}>
                Welcome back {data?.patient?.name ?? "Loading..."}
              </Text>
              <Text style={styles.subtitleText}>
                Civil ID: {data?.patient?.civilID || "N/A"}
              </Text>
            </View>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={32} color="#6d9c7a" />
            </View>
          </View>
        </>
      )}

      {/* ✅ Toggle Buttons */}
      <View style={{ flexDirection: "row", marginTop: 20 }}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            activeButton === 'book'
              ? { backgroundColor: "#6d9c7a" }
              : {
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "#ccc",
                },
          ]}
          onPress={() => {
            setActiveButton('book');
            setTimeout(() => {
              router.push("/book-appointment");
            }, 100);
          }}
        >
          <Text
            style={[
              styles.bookButtonText,
              activeButton === 'book'
                ? { color: "#fff" }
                : { color: "#374151" },
            ]}
          >
            Book Appointment
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.prevButton,
            activeButton === 'previous'
              ? { backgroundColor: "#6d9c7a", borderColor: "#6d9c7a" }
              : { backgroundColor: "#fff", borderColor: "#ccc" },
          ]}
          onPress={() => {
            setActiveButton('previous');
            router.push("/previous-appointments");
          }}
        >
          <Text
            style={[
              styles.prevButtonText,
              activeButton === 'previous'
                ? { color: "#fff" }
                : { color: "#374151" },
            ]}
          >
            Previous Appointments
          </Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Appointments Today */}
      <View style={[styles.welcomeCard, { marginTop: 20, marginBottom: 20 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcomeText}>Today's Upcoming Appointments</Text>
          {todaysAppointments.length === 0 ? (
            <Text style={{ color: '#6b7280' }}>No upcoming appointments for today.</Text>
          ) : (
            todaysAppointments.map((appt: any) => (
              <View key={appt._id} style={{ paddingVertical: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>{appt.doctorName}</Text>
                <Text>{appt.time} - {appt.type}</Text>
              </View>
            ))
          )}
        </View>
      </View>
      {/* Calendar with Appointments */}
      <View style={{ maxWidth: 340, alignSelf: 'center', width: '100%', marginBottom: 24, borderWidth: 1, borderColor: '#568065', borderRadius: 12, overflow: 'hidden' }}>
        <Calendar
          markingType={'multi-dot'}
          markedDates={markedDates}
          theme={{
            todayTextColor: '#568065',
            dotColor: '#568065',
            selectedDotColor: '#b7e2c7',
            arrowColor: '#568065',
            monthTextColor: '#222',
            textMonthFontWeight: 'bold',
            textDayFontWeight: '500',
            textDayHeaderFontWeight: '600',
          }}
        />
      </View>

      {/* 🗓️ Appointments */}
      {/* showPreviousAppointments && ( */}
        <View style={{ marginTop: 30, width: "100%", paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
            Your Appointments
          </Text>
          {isAppointmentsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={AppColors.primary} />
              <Text style={styles.loadingText}>Loading appointments...</Text>
            </View>
          ) : isAppointmentsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load appointments</Text>
              <Text style={styles.errorDetails}>{appointmentsError?.message}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : appointments.length === 0 ? (
            <Text style={{ color: "#6b7280" }}>No appointments found.</Text>
          ) : (
            appointments.map((appt: any) => (
              <View
                key={appt._id}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: "#fff",
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: "#eee",
                }}
              >
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                  {appt.doctorName}
                </Text>
                <Text style={{ color: "#6b7280" }}>
                  {appt.date} @ {appt.time}
                </Text>
                <Text style={{ color: "#6b7280" }}>{appt.type}</Text>
              </View>
            ))
          )}
        </View>
      {/* ) */}
    </ScrollView>
  );

  const renderTabIcon = (tabName: ActiveTab, iconName: string) => {
    const isActive = activeTab === tabName;
    return (
      <Ionicons
        name={iconName as any}
        size={24}
        color={isActive ? AppColors.primary : "#9ca3af"}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>{renderContent()}</View>
      <View style={styles.bottomNav}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabPress("home")}
          >
            {renderTabIcon("home", "home")}
            <Text
              style={[
                styles.tabText,
                activeTab === "home" && styles.activeTabText,
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabPress("appointments")}
          >
            {renderTabIcon("appointments", "calendar")}
            <Text
              style={[
                styles.tabText,
                activeTab === "appointments" && styles.activeTabText,
              ]}
            >
              Appointments
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabPress("messages")}
          >
            {renderTabIcon("messages", "chatbubble")}
            <Text
              style={[
                styles.tabText,
                activeTab === "messages" && styles.activeTabText,
              ]}
            >
              Messages
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabPress("profile")}
          >
            {renderTabIcon("profile", "person")}
            <Text
              style={[
                styles.tabText,
                activeTab === "profile" && styles.activeTabText,
              ]}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  mainContent: { flex: 1 },
  content: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 80,
  },
  welcomeCard: {
    backgroundColor: "#eaf7ef",
    borderRadius: 16,
    borderLeftWidth: 6,
    borderLeftColor: "#8bb2a3", // updated green shade
    padding: 16,
    marginVertical: 16,
    marginHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: "#555",
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#93c5fd",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eaf7ef",
    marginLeft: 12,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#6b7280",
  },
  errorContainer: {
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomNav: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    maxWidth: 400,
    alignSelf: "center",
  },
  tab: { alignItems: "center", paddingVertical: 8, paddingHorizontal: 12 },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
    color: "#9ca3af",
  },
  activeTabText: { color: AppColors.primary },
  bookButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  bookButtonText: { fontSize: 14, fontWeight: "600" },
  prevButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  prevButtonText: { fontSize: 14, fontWeight: "600" },
});
