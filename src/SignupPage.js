import React, { useState } from "react";
import { Container, Grid, Paper, TextField, Button, Typography, MenuItem, IconButton, InputAdornment } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css"; // Import Material UI style for PhoneInput
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";



const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (Swaziland)", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos",
  "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
  "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
  "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)", "Namibia", "Nauru", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
  "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
  "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe"
];

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    website: "",
    role: "",
    password: "",
    repeatPassword: "",
    companyName: "",
    vatNumber: "",
    county: "",
    city: "",
    address: "",
    zipCode: "",
    state: "",
  });

  // State to handle validation errors
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  // List of required fields
  const requiredFields = ["firstName", "lastName", "email", "password", "repeatPassword", "companyName"];

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phone: value });
  };

  // Toggle password visibility
  const handleClickShowPassword = () => setShowPassword((prev) => !prev);
  const handleClickShowRepeatPassword = () => setShowRepeatPassword((prev) => !prev);

  // Validate form
  const validateForm = () => {
    let newErrors = {};

    // Required field validation
    requiredFields.forEach((key) => {
      if (!formData[key]) newErrors[key] = "This field is required";
    });

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password length validation
    if (formData.password.length < 5 || formData.password.length > 10) {
      newErrors.password = "Password must be between 5 and 10 characters";
    }

    // Check if passwords match
    if (formData.password !== formData.repeatPassword) {
      newErrors.repeatPassword = "Passwords do not match";
    }

    // Phone number validation (numeric only)
    if (formData.phone && !/^[0-9]+$/.test(formData.phone)) {
      newErrors.phone = "Phone number must contain only numbers";
    }

    // VAT number validation
    if (formData.vatNumber && !/^[0-9]+$/.test(formData.vatNumber)) {
      newErrors.vatNumber = "VAT number must contain only numbers";
    }

    // Zip Code validation
    if (formData.zipCode && !/^[0-9]+$/.test(formData.zipCode)) {
      newErrors.zipCode = "Zip Code must contain only numbers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form Submitted");

      // Reset form and errors
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        website: "",
        role: "",
        password: "",
        repeatPassword: "",
        companyName: "",
        vatNumber: "",
        county: "",
        city: "",
        address: "",
        zipCode: "",
        state: "",
      });
      setErrors({});
      // Navigate to login page
      navigate("/login");
    }
  };

  return (
    <Container
      sx={{
        minHeight: "100vh",
        minWidth: "100%",
        backgroundColor: "#e3f2fd",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >


      <Paper sx={{ padding: "30px", maxWidth: "1200px", borderRadius: "10px", boxShadow: 2, position: "relative" }}>
        {/* Close icon positioned at the top right */}
      


        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", fontFamily: "Marquis", fontSize: "1.75rem" }}
        >
          SIGN UP
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              {[{ label: "First Name", name: "firstName" }, { label: "Last Name", name: "lastName" }, { label: "Website", name: "website" }, { label: "Role Position", name: "role" }].map((field) => (
                <TextField
                  key={field.name}
                  fullWidth
                  label={`${field.label}${requiredFields.includes(field.name) ? " *" : ""}`}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  error={!!errors[field.name]}
                  helperText={errors[field.name]}
                  margin="normal"
                />
              ))}

              {/* Phone Number with Country Code */}
              <PhoneInput
                country={"in"}
                value={formData.phone}
                onChange={handlePhoneChange}
                inputStyle={{ width: "100%", height: "56px", fontSize: "16px" }}
                containerStyle={{ marginTop: "16px" }}
                specialLabel="Phone Number"
              />
              {errors.phone && <Typography color="error" sx={{ fontSize: "0.875rem", mt: 1 }}>{errors.phone}</Typography>}
            </Grid>

            <Grid item xs={12} sm={4}>
              {[{ label: "Password", name: "password", type: showPassword ? "text" : "password" }, { label: "Repeat Password", name: "repeatPassword", type: showRepeatPassword ? "text" : "password" }, { label: "Zip Code", name: "zipCode" }, { label: "City", name: "city" }, { label: "Address", name: "address" }].map((field) => (
                <TextField
                  key={field.name}
                  fullWidth
                  label={`${field.label}${requiredFields.includes(field.name) ? " *" : ""}`}
                  name={field.name}
                  type={field.name === "password" ? showPassword ? "text" : "password" : showRepeatPassword ? "text" : "password"}
                  value={formData[field.name]}
                  onChange={handleChange}
                  error={!!errors[field.name]}
                  helperText={errors[field.name]}
                  margin="normal"
                  InputProps={{
                    endAdornment: field.name === "password" || field.name === "repeatPassword" ? (
                      <InputAdornment position="end">
                        <IconButton onClick={field.name === "password" ? handleClickShowPassword : handleClickShowRepeatPassword}>
                          {field.name === "password" ? (showPassword ? <VisibilityOff /> : <Visibility />) : (showRepeatPassword ? <VisibilityOff /> : <Visibility />)}
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                />
              ))}
            </Grid>

            <Grid item xs={12} sm={4}>
              {[{ label: "Company Name", name: "companyName" }, { label: "Email Address", name: "email" }, { label: "VAT Number", name: "vatNumber" }, { label: "State", name: "state" }].map((field) => (
                <TextField
                  key={field.name}
                  fullWidth
                  label={`${field.label}${requiredFields.includes(field.name) ? " *" : ""}`}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  error={!!errors[field.name]}
                  helperText={errors[field.name]}
                  margin="normal"
                />
              ))}
              <TextField select fullWidth label="Country" name="country" value={formData.country} onChange={handleChange} margin="normal">
                {countries.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Grid container justifyContent="center" spacing={2} sx={{ mt: 3 }}>
            <Grid item>
              <Button type="submit" variant="contained" color="primary">
                Register
              </Button>
              </Grid>
              <Grid item>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate("/login")}
              >
                Close
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default SignupPage;