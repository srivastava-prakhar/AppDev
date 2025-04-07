import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, Slider, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Animated,
  TextInput,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Image } from "react-native";
import { useRef } from "react";
import "react-native-reanimated";
import BottomSheet from "@gorhom/bottom-sheet";
import { ThemeContext } from "../ThemeContext";
const GOOGLE_PLACES_API_KEY = "AIzaSyCJhmvlc_NkJF4FClIMtDbtKx_ozAdzM0g";

const fetchNearbyGyms = async (latitude, longitude, radius) => {
  const type = "gym";
  const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${GOOGLE_PLACES_API_KEY}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Google API Error: ${data.status}`);
    }

    return data.results.map((place) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity || "No address available",
      rating: place.rating || "N/A",
      openNow: place.opening_hours?.open_now ? "Open Now" : "Closed",
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },
      photoReference: place.photos?.[0]?.photo_reference || null,
    }));
  } catch (error) {
    console.error("Error fetching gyms:", error);
    throw error;
  }
};

const MapScreen = () => {
  const [location, setLocation] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [selectedGym, setSelectedGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listVisible, setListVisible] = useState(false);
  const animation = useState(new Animated.Value(0))[0];
  const navigation = useNavigation();
  const [radius, setRadius] = useState(5000);
  const mapRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const { isDarkMode, toggleTheme, colors } = useContext(ThemeContext);
  const styles = getStyles(colors);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 10 }}>
          <Text style={{ color: colors.text }}>{isDarkMode ? "☀️" : "🌙"}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isDarkMode]);

  const getGyms = async (searchRadius) => {
    setLoading(true);
    setError(null);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access location was denied.");
        setLoading(false);
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);

      const fetchedGyms = await fetchNearbyGyms(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        searchRadius
      );

      setGyms(fetchedGyms);
    } catch (err) {
      setError("Failed to fetch gyms. Check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGyms(radius);
  }, []);

  const toggleList = () => {
    Animated.spring(animation, {
      toValue: listVisible ? 0 : 1,
      friction: 8,
      tension: 70,
      useNativeDriver: false,
    }).start();
    setListVisible(!listVisible);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingTitle}>GymFinder</Text>
            <ActivityIndicator size="large" color="#007BFF" />
            <Text style={styles.loadingText}>Fetching nearby gyms...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={getGyms}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <MapView
              ref={mapRef}
              style={styles.map}
              region={{
                latitude: location?.latitude || 37.7749,
                longitude: location?.longitude || -122.4194,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              {location && (
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title="Your Location"
                  pinColor="blue"
                />
              )}

              {gyms.map((gym) => (
                <Marker
                  key={gym.id}
                  coordinate={{
                    latitude: gym.location.lat,
                    longitude: gym.location.lng,
                  }}
                  title={gym.name}
                  description={`⭐ Rating: ${gym.rating} \n📍 ${gym.address}`}
                  onPress={() => {
                    // console.log("Gym Selected:", gym.name);
                    setSelectedGym(gym);
                    bottomSheetRef.current?.expand();
                  }}
                >
                  <Image
                    source={require("../assets/gym.png")}
                    style={{
                      width: selectedGym?.id === gym.id ? 50 : 30,
                      height: selectedGym?.id === gym.id ? 50 : 30,
                      tintColor: selectedGym?.id === gym.id ? "red" : "black",
                    }}
                    resizeMode="contain"
                  />
                </Marker>
              ))}
            </MapView>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Search Radius (meters):</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: isDarkMode ? "#555" : "#ccc",
                  },
                ]}
                placeholder="Enter radius (e.g., 5000)"
                placeholderTextColor={isDarkMode ? "#888" : "#aaa"}
                keyboardType="numeric"
                value={radius}
                onChangeText={(text) => {
                  if (/^\d*$/.test(text)) {
                    setRadius(text);
                  }
                }}
              />

              {/* <View style={{ height: 5 }} />   */}

              {radius !== "" &&
                (parseInt(radius) < 1000 || parseInt(radius) > 20000) && (
                  <Text style={styles.errorText}>
                    Enter a value between 1K - 20K
                  </Text>
                )}

              <TouchableOpacity
                style={[
                  styles.searchButton,
                  radius !== "" &&
                    (parseInt(radius) < 1000 || parseInt(radius) > 20000) &&
                    styles.disabledButton,
                ]}
                onPress={() => {
                  const validRadius =
                    radius.trim() === "" ? 5000 : parseInt(radius); // Default to 5000 if empty
                  getGyms(validRadius);
                }}
                disabled={
                  radius !== "" &&
                  (parseInt(radius) < 1000 || parseInt(radius) > 20000)
                }
              >
                <Text style={[styles.searchButtonText, { color: colors.text }]}>
                  Search
                </Text>
              </TouchableOpacity>
            </View>

            {selectedGym && (
              <View style={styles.gymInfoCard}>
                <Text style={styles.gymName}>{selectedGym.name}</Text>
                <Text style={styles.gymAddress}>{selectedGym.address}</Text>
                <Text style={styles.gymRating}>⭐ {selectedGym.rating}</Text>
                <Text style={styles.gymStatus}>
                  {selectedGym.openNow === "Open Now"
                    ? "✅ Open Now"
                    : "❌ Closed"}
                </Text>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() =>
                    navigation.navigate("GymDetails", { gym: selectedGym })
                  }
                >
                  <Text style={styles.detailsButtonText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedGym(null)}
                >
                  <Text style={styles.closeButtonText}>✖ Close</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => {
                  toggleList();
                  setSelectedGym(null);
                }}
              >
                <Text style={styles.toggleButtonText}>
                  {listVisible ? "Hide List" : "Show Gyms"}
                </Text>
              </TouchableOpacity>
            </View>

            {listVisible && (
              <Animated.View
                style={[
                  styles.listContainer,
                  {
                    height: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 250],
                    }),
                  },
                ]}
              >
                <FlatList
                  data={gyms}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.gymItem}
                      onPress={() => {
                        setSelectedGym(item);
                        toggleList();
                        bottomSheetRef.current?.expand();

                        if (mapRef.current) {
                          mapRef.current.animateToRegion(
                            {
                              latitude: item.location.lat,
                              longitude: item.location.lng,
                              latitudeDelta: 0.02,
                              longitudeDelta: 0.02,
                            },
                            500
                          );
                        }
                      }}
                    >
                      <Text style={styles.gymName}>{item.name}</Text>
                      <Text style={styles.gymAddress}>{item.address}</Text>
                      <Text style={styles.gymRating}>⭐ {item.rating}</Text>
                      <Text style={styles.gymStatus}>
                        {item.openNow === "Open Now"
                          ? "✅ Open Now"
                          : "❌ Closed"}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </Animated.View>
            )}
            <BottomSheet
              ref={bottomSheetRef}
              index={-1}
              snapPoints={["40%", "60%"]}
              backgroundStyle={{ backgroundColor: "#fff" }}
            >
              {selectedGym && (
                <View style={styles.bottomSheetContent}>
                  <Text style={styles.gymName}>{selectedGym.name}</Text>
                  <Text style={styles.gymAddress}>{selectedGym.address}</Text>
                  <Text style={styles.gymRating}>⭐ {selectedGym.rating}</Text>
                  <Text style={styles.gymStatus}>
                    {selectedGym.openNow === "Open Now"
                      ? "✅ Open Now"
                      : "❌ Closed"}
                  </Text>
                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() =>
                      navigation.navigate("GymDetails", { gym: selectedGym })
                    }
                  >
                    <Text style={styles.detailsButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              )}
            </BottomSheet>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};
const getStyles = (colors) =>
  StyleSheet.create({
    map: { flex: 1 },
    buttonContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      alignItems: "center",
    },
    toggleButton: {
      backgroundColor: colors.button,
      padding: 12,
      borderRadius: 5,
      alignItems: "center",
      width: "90%",
    },
    toggleButtonText: {
      color: colors.buttonText,
      fontSize: 14,
      fontWeight: "bold",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loadingTitle: {
      fontSize: 48,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 15,
    },

    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: colors.link,
    },
    gymInfoCard: {
      position: "absolute",
      left: 20,
      right: 20,
      bottom: 20,
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 2 },
      elevation: 5,
      alignItems: "center",
    },
    gymName: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    gymAddress: {
      fontSize: 14,
      color: colors.subtleText,
    },
    gymRating: {
      fontSize: 14,
      color: "#f39c12",
    },
    gymStatus: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.text,
    },
    detailsButton: {
      marginTop: 10,
      padding: 10,
      backgroundColor: colors.button,
      borderRadius: 5,
      alignItems: "center",
      width: "100%",
    },
    detailsButtonText: {
      color: colors.buttonText,
      fontSize: 16,
      fontWeight: "bold",
    },
    closeButton: {
      marginTop: 10,
      padding: 8,
      backgroundColor: "#DC3545",
      borderRadius: 5,
      alignItems: "center",
      width: "100%",
    },
    closeButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "bold",
    },
    inputContainer: {
      position: "absolute",
      top: 35,
      left: 0,
      right: 0,
      backgroundColor: colors.card,
      padding: 10,
      borderRadius: 5,
      elevation: 5,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    input: {
      backgroundColor: colors.background,
      color: colors.text,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 5,
      borderColor: "#ccc",
      borderWidth: 1,
      flex: 1,
      marginRight: 10,

      fontSize: 16,
      height: 40,
      minWidth: 100,
      textAlign: "center",
    },

    label: {
      color: colors.text,
      fontWeight: "bold",
      marginRight: 10,
    },
    errorText: {
      color: "red",
      fontSize: 12,
      marginTop: 5,
      textAlign: "left",
      width: "90%",
      flexWrap: "wrap",
      alignSelf: "center",
    },
    disabledButton: {
      backgroundColor: "#ccc",
    },
    bottomSheetContent: {
      padding: 20,
      backgroundColor: colors.card,
      alignItems: "center",
    },
    gymItem: {
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 8,
      marginVertical: 5,
      borderLeftWidth: 4,
      borderLeftColor: colors.link,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 1 },
      elevation: 3,
    },
    listContainer: {
      position: "absolute",
      bottom: 10,
      left: 10,
      right: 10,
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 15,
      paddingBottom: 10,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 6,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      padding: 20,
    },
    retryButton: {
      backgroundColor: colors.button,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 5,
      alignItems: "center",
    },
    retryButtonText: {
      color: colors.buttonText,
      fontSize: 16,
      fontWeight: "bold",
    },
  });

export default MapScreen;
