import React, { useState, useEffect, useContext, createContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Image, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import mpesaIcon from '../assets/mpesa-icon.png';
import airtelIcon from '../assets/airtel-icon.png';
import equitelIcon from '../assets/equitel-icon.png';
import tigoIcon from '../assets/tigo-icon.png';
import mtnIcon from '../assets/mtn-icon.png';


// Global State Context
const AppContext = createContext();

const Tab = createBottomTabNavigator();

// Language translations
const languages = {
  en: {
    appName: 'VeloPesa',
    availableBalance: 'Available Balance',
    greeting: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
    },
    tagline: 'Swift and Secure Escrow for Your Mobile Payments',
    quickActions: {
      pay: 'Pay',
      request: 'Request',
      escrow: 'Escrow',
    },
    insights: {
      title: 'Quick Insights',
      spending: 'Spending',
    },
    activeEscrows: {
      title: 'Active Escrows',
      freelanceWork: 'Freelance Work for Backers App',
      awaitingDelivery: 'Awaiting delivery',
      productPurchase: 'Car tyres purchase from Nairobi Drive',
      readyForRelease: 'Ready for release',
    },
    paymentOptions: {
      title: 'Payment Options',
    },
    transactionHistory: {
      title: 'Transaction History',
      groceries: 'Groceries',
      coffeeShop: 'Coffee Shop',
      freelancePay: 'Freelance Pay',
    },
    navigation: {
      home: 'Home',
      send: 'Send',
      explore: 'Explore',
      insights: 'Insights',
      contacts: 'Contacts',
    },
    newTransaction: {
      title: 'New Transaction',
      iAm: 'I Am...',
      buying: 'Buying',
      selling: 'Selling',
      brokering: 'Brokering',
      chooseCategory: 'Choose Category',
      categories: {
        generalGoods: 'General Goods',
        motorVehicles: 'Motor Vehicles',
        generalServices: 'General Services',
        electronics: 'Electronics',
        freelancing: 'Freelancing',
        other: 'Other',
      },
      fee: 'Transaction Fee:',
      continue: 'Continue',
    },
    escrowProcess: {
      startTransaction: 'Start Escrow Transaction',
      agreeToTerms: 'Agree to Terms',
      payment: 'Payment',
      delivery: 'Delivery',
      approval: 'Approval',
      escrowRelease: 'Escrow Release',
      disputeProcess: 'Dispute Process',
      disputeLodged: 'Dispute Lodged',
      internalResolution: 'Internal Resolution',
      escalation: 'Escalation',
      decision: 'Decision',
    },
    paymentModal: {
      title: 'Make Payment',
      amount: 'Amount',
      currency: 'Currency',
      recipient: 'Recipient',
      description: 'Description',
      pay: 'Pay Now',
    },
  },
  sw: {
    // Add Swahili translations here
  },
};

// Add the country configurations after your language translations
const countryConfigs = {
  KE: {
    currency: 'KES',
    paymentOptions: [
      { id: 'mpesa', name: 'M-PESA', icon: mpesaIcon },
      { id: 'airtel', name: 'Airtel Money', icon: airtelIcon },
      { id: 'equitel', name: 'Equitel', icon: equitelIcon },
    ]
  },
  TZ: {
    currency: 'TZS',
    paymentOptions: [
      { id: 'tigopesa', name: 'TigoPesa', icon: tigoIcon },
      { id: 'mpesa', name: 'M-PESA', icon: mpesaIcon },
      { id: 'airtel', name: 'Airtel Money', icon: airtelIcon },
    ]
  },
  UG: {
    currency: 'UGX',
    paymentOptions: [
      { id: 'mtn', name: 'MTN Mobile Money', icon: mtnIcon },
      { id: 'airtel', name: 'Airtel Money', icon: airtelIcon },
    ]
  },
};

// Styled components (existing + new ones)
const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #f8f9fa;
`;

const HeaderContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
`;

const AppName = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  color: #4e54c8;
`;

const HeaderIcons = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const HeaderIcon = styled(Icon)`
  font-size: 24px;
  margin-left: 16px;
`;

const LanguageToggle = styled(TouchableOpacity)`
  padding: 8px;
  margin-left: 16px;
  background-color: #4e54c8;
  border-radius: 4px;
`;

const LanguageText = styled(Text)`
  font-size: 14px;
  color: #ffffff;
`;

const Greeting = styled(Text)`
  font-size: 24px;
  font-weight: bold;
  margin: 16px;
`;

const Tagline = styled(Text)`
  font-size: 16px;
  color: #666;
  margin: 0 16px 16px 16px;
`;

const BalanceCard = styled(LinearGradient)`
  padding: 24px;
  border-radius: 12px;
  margin: 16px;
`;

const BalanceText = styled(Text)`
  color: #fff;
  font-size: 16px;
`;

const BalanceAmount = styled(Text)`
  color: #fff;
  font-size: 32px;
  font-weight: bold;
  margin-top: 8px;
`;

const QuickActionsContainer = styled(View)`
  flex-direction: row;
  justify-content: space-around;
  margin: 16px;
`;

const QuickActionButton = styled(TouchableOpacity)`
  align-items: center;
`;

const QuickActionIcon = styled(Icon)`
  font-size: 24px;
  color: #4e54c8;
  margin-bottom: 8px;
`;

const QuickActionText = styled(Text)`
  color: #4e54c8;
`;

const SectionTitle = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
`;

const Card = styled(View)`
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin: 16px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const PaymentOptionsContainer = styled(View)`
  margin-bottom: 15px;
`;

const PaymentOptionButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding: 12px;
  border-width: 1px;
  border-color: ${props => props.selected ? '#4e54c8' : '#ddd'};
  border-radius: 8px;
  margin-bottom: 10px;
  background-color: ${props => props.selected ? '#f0f1ff' : '#ffffff'};
`;

const PaymentOptionIcon = styled(Image)`
  width: 32px;
  height: 32px;
  margin-right: 12px;
`;

const PaymentOptionText = styled(Text)`
  font-size: 16px;
  color: ${props => props.selected ? '#4e54c8' : '#333333'};
  font-weight: ${props => props.selected ? 'bold' : 'normal'};
`;

// New Transaction Modal Styled Components
const NewTransactionButton = styled(TouchableOpacity)`
  background-color: #4e54c8;
  padding: 12px 20px;
  border-radius: 8px;
  margin: 16px;
`;

const NewTransactionButtonText = styled(Text)`
  color: white;
  font-size: 16px;
  text-align: center;
  font-weight: bold;
`;

// Payment Modal Styled Components
const ModalContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled(View)`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
`;

const ModalTitle = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const Input = styled(TextInput)`
  border-width: 1px;
  border-color: #ddd;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
`;

const ModalButton = styled(TouchableOpacity)`
  background-color: #4e54c8;
  padding: 10px;
  border-radius: 5px;
  align-items: center;
  margin-top: 10px;
`;

const ModalButtonText = styled(Text)`
  color: white;
  font-size: 16px;
`;

// Home Screen Component
const HomeScreen = ({ navigation }) => {
  const { t, currentLanguage, toggleLanguage, greeting, user, balance, transactions, fetchUserData } = useContext(AppContext);
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [showEscrowProcess, setShowEscrowProcess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return (
    <Container>
      <ScrollView>
        <HeaderContainer>
          <AppName>{t.appName}</AppName>
          <HeaderIcons>
            <HeaderIcon name="notifications-outline" />
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <HeaderIcon name="person-circle-outline" />
            </TouchableOpacity>
            <LanguageToggle onPress={toggleLanguage}>
              <LanguageText>{currentLanguage.toUpperCase()}</LanguageText>
            </LanguageToggle>
          </HeaderIcons>
        </HeaderContainer>

        <Greeting>{greeting}, {user.name}</Greeting>
        <Tagline>{t.tagline}</Tagline>

        <NewTransactionButton onPress={() => setShowNewTransaction(true)}>
          <NewTransactionButtonText>{t.newTransaction.title}</NewTransactionButtonText>
        </NewTransactionButton>

        <BalanceCard colors={['#4e54c8', '#8f94fb']}>
          <BalanceText>{t.availableBalance}</BalanceText>
          <BalanceAmount>{user.currency} {balance.toFixed(2)}</BalanceAmount>
        </BalanceCard>

        <QuickActionsContainer>
          <QuickActionButton onPress={() => setShowPaymentModal(true)}>
            <QuickActionIcon name="wallet-outline" />
            <QuickActionText>{t.quickActions.pay}</QuickActionText>
          </QuickActionButton>
          <QuickActionButton onPress={() => navigation.navigate('Send')}>
            <QuickActionIcon name="cash-outline" />
            <QuickActionText>{t.quickActions.request}</QuickActionText>
          </QuickActionButton>
          <QuickActionButton onPress={() => setShowEscrowProcess(true)}>
            <QuickActionIcon name="shield-checkmark-outline" />
            <QuickActionText>{t.quickActions.escrow}</QuickActionText>
          </QuickActionButton>
        </QuickActionsContainer>

        <Card>
          <SectionTitle>{t.insights.title}</SectionTitle>
          <Text>{t.insights.spending}: {user.currency} {user.spending.toFixed(2)}</Text>
        </Card>

        <Card>
          <SectionTitle>{t.activeEscrows.title}</SectionTitle>
          <Text>{t.activeEscrows.freelanceWork}</Text>
          <Text>{t.activeEscrows.awaitingDelivery}</Text>
          <Text>{t.activeEscrows.productPurchase}</Text>
          <Text>{t.activeEscrows.readyForRelease}</Text>
        </Card>

        <Card>
          <SectionTitle>{t.transactionHistory.title}</SectionTitle>
          {transactions.map((transaction, index) => (
            <Text key={index}>{transaction.description}: {user.currency} {transaction.amount.toFixed(2)}</Text>
          ))}
        </Card>
      </ScrollView>

      <NewTransactionModal visible={showNewTransaction} onClose={() => setShowNewTransaction(false)} />
      <EscrowProcessModal visible={showEscrowProcess} onClose={() => setShowEscrowProcess(false)} />
      <PaymentModal visible={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
    </Container>
  );
};

// New Transaction Modal Component
const NewTransactionModal = ({ visible, onClose }) => {
  const [transactionType, setTransactionType] = useState('buying');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!amount || !description || !selectedCategory) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // Submit transaction API call
      Alert.alert('Success', 'Transaction created successfully');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to create transaction');
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <Container>
        {/* Modal content here */}
      </Container>
    </Modal>
  );
};

// Payment Modal Component
const PaymentModal = ({ visible, onClose }) => {
  const { t, user, currentCountry } = useContext(AppContext);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPaymentOption, setSelectedPaymentOption] = useState(null);
  const [loading, setLoading] = useState(false);

  const countryConfig = countryConfigs[currentCountry] || countryConfigs.KE;

  const handlePayment = async () => {
    if (!amount || !recipient || !description || !selectedPaymentOption) {
      Alert.alert('Error', 'Please fill in all fields and select a payment option');
      return;
    }

    setLoading(true);
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`Processing payment of ${countryConfig.currency} ${amount} to ${recipient} via ${selectedPaymentOption.name}`);
      Alert.alert('Success', 'Payment sent successfully');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to send payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <ModalContainer>
        <ModalContent>
          <ModalTitle>{t.paymentModal.title}</ModalTitle>
          
          <Text style={{ marginBottom: 8, color: '#666' }}>Amount ({countryConfig.currency})</Text>
          <Input
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          
          <Text style={{ marginBottom: 8, color: '#666' }}>Recipient</Text>
          <Input
            placeholder="Enter phone number or select contact"
            value={recipient}
            onChangeText={setRecipient}
          />
          
          <Text style={{ marginBottom: 8, color: '#666' }}>Description</Text>
          <Input
            placeholder="What's this payment for?"
            value={description}
            onChangeText={setDescription}
          />
          
          <Text style={{ marginBottom: 8, color: '#666' }}>Select Payment Method</Text>
          <PaymentOptionsContainer>
            {countryConfig.paymentOptions.map((option) => (
              <PaymentOptionButton
                key={option.id}
                onPress={() => setSelectedPaymentOption(option)}
                selected={selectedPaymentOption?.id === option.id}
              >
                <PaymentOptionIcon source={option.icon} />
                <PaymentOptionText selected={selectedPaymentOption?.id === option.id}>
                  {option.name}
                </PaymentOptionText>
              </PaymentOptionButton>
            ))}
          </PaymentOptionsContainer>
          
          <ModalButton onPress={handlePayment} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <ModalButtonText>{t.paymentModal.pay}</ModalButtonText>
            )}
          </ModalButton>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

const App = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [greeting, setGreeting] = useState('');
  const [user, setUser] = useState({
    name: 'John Nyagaka',
    currency: 'KES', // Default to Kenyan Shilling
    spending: 5000,
  });
  const [balance, setBalance] = useState(10000);
  const [transactions, setTransactions] = useState([
    { description: 'Groceries', amount: -2000 },
    { description: 'Freelance Pay', amount: 5000 },
    { description: 'Coffee Beans', amount: -500 },
  ]);

  const [currentCountry, setCurrentCountry] = useState('KE');

  const toggleLanguage = () => {
    setCurrentLanguage(currentLanguage === 'en' ? 'sw' : 'en');
  };


  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting(languages[currentLanguage].greeting.morning);
    } else if (hour < 18) {
      setGreeting(languages[currentLanguage].greeting.afternoon);
    } else {
      setGreeting(languages[currentLanguage].greeting.evening);
    }
  }, [currentLanguage]);

  const fetchUserData = async () => {

    // Simulating API call
    // In the app, you would fetch this data from your backend

    setUser({
      name: 'John Nyagaka',
      currency: 'KES',
      spending: 5000,
    });
    setBalance(10000);
    setTransactions([
      { description: 'Groceries', amount: -2000 },
      { description: 'Freelance Pay', amount: 5000 },
      { description: 'Coffee Beans', amount: -500 },
    ]);
  };

  const t = languages[currentLanguage];

  // List of East, Central, and Southern African currencies
  const currencies = [
    { code: 'KES', name: 'Kenyan Shilling' },
    { code: 'TZS', name: 'Tanzanian Shilling' },
    { code: 'UGX', name: 'Ugandan Shilling' },
    { code: 'RWF', name: 'Rwandan Franc' },
    { code: 'BIF', name: 'Burundian Franc' },
    { code: 'ETB', name: 'Ethiopian Birr' },
    { code: 'SOS', name: 'Somali Shilling' },
    { code: 'ZAR', name: 'South African Rand' },
    { code: 'MZN', name: 'Mozambican Metical' },
    { code: 'ZMW', name: 'Zambian Kwacha' },
    { code: 'BWP', name: 'Botswana Pula' },
    { code: 'NAD', name: 'Namibian Dollar' },
    { code: 'MWK', name: 'Malawian Kwacha' },
    { code: 'ZWL', name: 'Zimbabwean Dollar' },
  ];

  return (
    <AppContext.Provider value={{
      t,
      currentLanguage,
      toggleLanguage,
      greeting,
      user,
      balance,
      transactions,
      fetchUserData,
      currencies,
      currentCountry,
      setCurrentCountry,
    }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
              else if (route.name === 'Pay') iconName = focused ? 'wallet' : 'wallet-outline';
              else if (route.name === 'Send') iconName = focused ? 'send' : 'send-outline';
              else if (route.name === 'Explore') iconName = focused ? 'compass' : 'compass-outline';
              else if (route.name === 'Insights') iconName = focused ? 'pie-chart' : 'pie-chart-outline';
              else if (route.name === 'Contacts') iconName = focused ? 'people' : 'people-outline';
              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#4e54c8',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Pay" component={PayScreen} />
          <Tab.Screen name="Send" component={SendScreen} />
          <Tab.Screen name="Explore" component={ExploreScreen} />
          <Tab.Screen name="Insights" component={InsightsScreen} />
          <Tab.Screen name="Contacts" component={ContactsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
};

// Placeholder components for other screens
const PayScreen = () => <View><Text>Pay Screen</Text></View>;
const SendScreen = () => <View><Text>Send Screen</Text></View>;
const ExploreScreen = () => <View><Text>Explore Screen</Text></View>;
const InsightsScreen = () => <View><Text>Insights Screen</Text></View>;
const ContactsScreen = () => <View><Text>Contacts Screen</Text></View>;

export default App;
