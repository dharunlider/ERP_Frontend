import React, { useState, useEffect } from "react";
import axios from "./Axiosinstance";
import {
  Box, Typography, Container, Grid, Button, Card, CardContent, CardActions, Chip, Divider, useTheme,
  Avatar, Stack, CircularProgress, Alert,
} from "@mui/material";
import HomeFooter from "./Constants/HomeFooter";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Navbar from "./Constants/Navbar";
import { useNavigate } from "react-router-dom";

const LiderERP = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {   
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/products");
        setProducts(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: theme.palette.background.default
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: theme.palette.background.default
      }}>
        <Alert severity="error" sx={{ width: '80%', maxWidth: 600 }}>
          Error loading products: {error}
        </Alert>
      </Box>
    );
  }

  // Function to get a color based on product code
  const getProductColor = (productCode) => {
    const colors = {
      PROD01: '#1e3a8a',
      PROD02: '#4338ca',
      PROD03: '#7c3aed',
      PROD04: '#0369a1',
    };
    return colors[productCode] || '#6b7280';
  };

  // Function to get an icon based on product category
  const getProductIcon = (category) => {
    const icons = {
      'Software': '💻',
      'Service': '🛠️',
      'Hardware': '🖥️',
      'App': '📱'
    };
    return icons[category] || '📦';
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default }}>
      <Navbar />

      <Box
        sx={{
          position: 'relative',
          py: { xs: 10, sm: 18 },
          textAlign: 'center',
          color: 'white',
          overflow: 'hidden',
        }}
      >
        {/* Background Image */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('/images/Bc1.jpg')",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            filter: 'blur(10px)',
            transform: 'scale(1.05)',
            zIndex: 0,
          }}
        />

        {/* Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1,
          }}
        />

        {/* Content */}
        <Container sx={{ position: 'relative', zIndex: 2 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              fontFamily: 'Marquis',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              color: 'white',
            }}
          >
            WELCOME TO LIDER TECHNOLOGY
          </Typography>

          <Typography
            variant="h5"
            component="p"
            sx={{
              mb: 4,
              fontFamily: 'Marquis',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              color: 'white',
            }}
          >
            Empowering businesses with innovative IT solutions.
          </Typography>

          <Button
            variant="contained"
            color="secondary"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{
              fontWeight: 'bold',
              fontFamily: 'Marquis',
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
            aria-label="Get Started"
            onClick={() => navigate('/login')}
          >
            Get Started
          </Button>
        </Container>
      </Box>

      {/* Products Section */}
      <Container maxWidth="xl" sx={{ py: 8, px: { xs: 2, md: 4 } }}>
        <Typography variant="h3" sx={{
          textAlign: 'center',
          mb: 6,
          fontWeight: 700,
          color: theme.palette.primary.main
        }}>
          Our Products
        </Typography>

        {products.length === 0 ? (
          <Alert severity="info" sx={{ mb: 4 }}>
            No products available at the moment. Please check back later.
          </Alert>
        ) : (
          <Grid container spacing={4}>
            {products.map((product) => {
              const productColor = getProductColor(product.productCode);
              const productIcon = getProductIcon(product.category);

              return (
                <Grid item xs={12} sm={6} lg={3} key={product.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(0,0,0,0.05)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 24px ${productColor}20`
                      }
                    }}
                  >
                    <Box sx={{
                      height: 8,
                      width: '100%',
                      background: `linear-gradient(90deg, ${productColor} 0%, ${productColor}80 100%)`,
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8
                    }} />

                    <CardContent sx={{
                      flexGrow: 1,
                      px: 3,
                      pt: 3,
                      pb: 1
                    }}>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                        <Avatar sx={{
                          bgcolor: `${productColor}20`,
                          color: productColor,
                          width: 48,
                          height: 48,
                          fontSize: 24
                        }}>
                          {productIcon}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="h5"
                            component="h2"
                            sx={{
                              fontWeight: 700,
                              color: productColor
                            }}
                          >
                            {product.productName}
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary">
                            {product.productCode}
                          </Typography>
                        </Box>
                      </Stack>

                      <Typography variant="body1" paragraph sx={{ color: 'text.secondary', mb: 2 }}>
                        {product.description}
                      </Typography>

                      <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.08)' }} />

                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2">Category:</Typography>
                          <Chip
                            label={product.category}
                            size="small"
                            sx={{
                              backgroundColor: `${productColor}10`,
                              color: 'text.primary',
                              border: `1px solid ${productColor}20`,
                              borderRadius: 1,
                              fontWeight: 500
                            }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2">Type:</Typography>
                          <Chip
                            label={product.type}
                            size="small"
                            sx={{
                              backgroundColor: `${productColor}10`,
                              color: 'text.primary',
                              border: `1px solid ${productColor}20`,
                              borderRadius: 1,
                              fontWeight: 500
                            }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2">Price:</Typography>
                          <Typography>${product.price}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2">Stock:</Typography>
                          <Typography>{product.stock}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2">Status:</Typography>
                          <Chip
                            label={product.active ? 'Active' : 'Inactive'}
                            size="small"
                            color={product.active ? 'success' : 'error'}
                            sx={{ fontWeight: 500 }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardActions sx={{
                      p: 3,
                      pt: 0
                    }}>

                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: productColor,
                          '&:hover': {
                            backgroundColor: `${productColor}d0`,
                            boxShadow: `0 4px 12px ${productColor}40`
                          }
                        }}
                        endIcon={<ArrowForwardIcon />}
                      >
                        Explore
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        <Box sx={{
          mt: 10,
          textAlign: 'center',
          backgroundColor: 'rgba(30, 58, 138, 0.05)',
          borderRadius: 3,
          p: 5,
          border: '1px dashed rgba(30, 58, 138, 0.2)'
        }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#1e3a8a' }}>
            Need a Custom Solution?
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: '600px', mx: 'auto', mb: 3 }}>
            Our team can build tailored software to meet your specific business requirements.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#1e3a8a',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              '&:hover': {
                backgroundColor: '#1e40af'
              }
            }}
          >
            Contact Our Team
          </Button>
        </Box>
      </Container>

      <HomeFooter />
    </Box>
  );
};

export default LiderERP;