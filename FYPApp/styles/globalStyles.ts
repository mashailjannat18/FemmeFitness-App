import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    width: '80%',
    padding: 12,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 16,
  },
  invalidInput: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    width: '80%',
    gap: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 40,
  },
  backButton: {
    backgroundColor: '#a9a9a9',
  },
  activeButton: {
    backgroundColor: '#d63384',
  },
  disabledButton: {
    backgroundColor: '#a9a9a9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  option: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: '#d63384',
    borderColor: '#d63384',
  },
  optionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  selectedOptionText: {
    color: '#fff',
  },
});