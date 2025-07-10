"use client";

import { useState } from "react";
import { Container, Center, Box } from "@mantine/core";
import { LoginForm } from "../components/LoginForm/login-form";
import { RegisterForm } from "../components/RegisterForm/register-form";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Container size="sm" style={{ minHeight: "100vh" }}>
      <Center style={{ minHeight: "100vh" }}>
        <Box w="100%" maw={600}>
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </Box>
      </Center>
    </Container>
  );
}
