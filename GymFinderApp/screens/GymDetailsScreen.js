import React, { useContext, useEffect } from "react";
import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { ThemeContext } from "../ThemeContext";

const GymDetailsScreen = ({ route, navigation }) => {
  const { gym } = route.params;
  const { isDarkMode, toggleTheme, colors } = useContext(ThemeContext);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 10 }}>
          <Text style={{ color: colors.text }}>{isDarkMode ? "☀️" : "🌙"}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isDarkMode]);

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${gym.location.lat},${gym.location.lng}`;
    Linking.openURL(url);
  };

  const callPhone = () => {
    if (gym.phone) {
      Linking.openURL(`tel:${gym.phone}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.gymName, { color: colors.text }]}>{gym.name}</Text>
      <Text style={[styles.gymAddress, { color: colors.subtleText }]}>
        {gym.address}
      </Text>
      <Text style={[styles.gymRating, { color: "#f39c12" }]}>
        ⭐ Rating: {gym.rating}
      </Text>
      <Text style={[styles.gymStatus, { color: colors.text }]}>
        {gym.openNow === "Open Now" ? "✅ Open Now" : "❌ Closed"}
      </Text>

      <Image
        source={
          gym.photoReference
            ? {
                uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${gym.photoReference}&key=AIzaSyCJhmvlc_NkJF4FClIMtDbtKx_ozAdzM0g`,
              }
            : require("../assets/default.jpeg")
        }
        style={styles.gymImage}
        resizeMode="cover"
      />

      {gym.phone && (
        <TouchableOpacity onPress={callPhone}>
          <Text style={[styles.gymPhone, { color: colors.link }]}>
            📞 Call: {gym.phone}
          </Text>
        </TouchableOpacity>
      )}

      {gym.hours && (
        <View style={styles.hoursContainer}>
          <Text style={[styles.hoursTitle, { color: colors.text }]}>
            🕒 Operating Hours:
          </Text>
          {Object.entries(gym.hours).map(([day, time]) => (
            <Text
              key={day}
              style={[styles.hourText, { color: colors.subtleText }]}
            >
              {day}: {time}
            </Text>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.directionsButton, { backgroundColor: colors.button }]}
        onPress={openGoogleMaps}
      >
        <Text
          style={[styles.directionsButtonText, { color: colors.buttonText }]}
        >
          📍 Get Directions
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: "#DC3545" }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>⬅ Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  gymName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  gymAddress: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "center",
  },
  gymRating: {
    fontSize: 16,
    marginBottom: 5,
  },
  gymStatus: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  gymPhone: {
    fontSize: 16,
    textDecorationLine: "underline",
    marginBottom: 15,
  },
  hoursContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  hoursTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 5,
  },
  hourText: {
    fontSize: 14,
  },
  directionsButton: {
    padding: 12,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
    marginBottom: 10,
  },
  directionsButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    padding: 10,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  gymImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
    resizeMode: "cover",
  },
});

export default GymDetailsScreen;
