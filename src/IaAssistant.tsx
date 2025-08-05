import {
    Avatar,
    Box,
    Flex,
    HStack,
    VStack,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useEffect, useRef, useState } from "react";


import IaAssistantHeader from "./components/Header.tsx";
import RenderBotAvatar from "./components/RenderBotAvatar.tsx";
import InputContainer from "./components/InputContainer.tsx";

import type {Message} from "./Types/Message.ts";
import {getAssistantResponse} from "./services/IAserviceApi.ts";

const typingDots = keyframes`
    0% { opacity: 0.2; transform: translateY(0); }
    20% { opacity: 1; transform: translateY(-3px); }
    100% { opacity: 0.2; transform: translateY(0); }
`;

const IaAssistant = () => {
    const userName = "Dali";

    const bottomRef = useRef<HTMLDivElement | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            from: "bot",
            text: "Hello! How can I help you today?",
            isTyping: false,
            isThinking: false
        },
    ]);

    const [inputValue, setInputValue] = useState("");
    const [botState, setBotState] = useState<"idle" | "thinking" | "typing">("idle");

    const bgColor = useColorModeValue("white", "gray.800");
    const userBg = useColorModeValue("blue.500", "blue.600");
    const botBg = useColorModeValue("gray.100", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");


    // const handleSend = () => {
    //     if (!inputValue.trim()) return;
    //
    //     const userMsg: Message = {
    //         id: messages.length + 1,
    //         from: "user",
    //         text: inputValue.trim(),
    //         isTyping: false,
    //         isThinking: false
    //     };
    //
    //     const thinkingMsg: Message = {
    //         id: messages.length + 2,
    //         from: "bot",
    //         text: "",
    //         isTyping: false,
    //         isThinking: true
    //     };
    //
    //     setMessages((prev) => [...prev, userMsg, thinkingMsg]);
    //     setInputValue("");
    //     setBotState("thinking");
    //
    //     setTimeout(() => {
    //         setMessages(prev =>
    //             prev.map(msg =>
    //                 msg.id === thinkingMsg.id
    //                     ? {
    //                         ...msg,
    //                         text: "",
    //                         isThinking: false,
    //                         isTyping: true
    //                     }
    //                     : msg
    //             )
    //         );
    //         setBotState("typing");
    //
    //         const fullText = "I understand you're asking about .Let me analyze that for you.;"
    //         let currentIndex = 0;
    //
    //         const interval = setInterval(() => {
    //             currentIndex++;
    //             setMessages(prev =>
    //                 prev.map(msg =>
    //                     msg.id === thinkingMsg.id
    //                         ? { ...msg, text: fullText.slice(0, currentIndex) }
    //                         : msg
    //                 )
    //             );
    //
    //             if (currentIndex >= fullText.length) {
    //                 clearInterval(interval);
    //                 setMessages(prev =>
    //                     prev.map(msg =>
    //                         msg.id === thinkingMsg.id
    //                             ? { ...msg, isTyping: false }
    //                             : msg
    //                     )
    //                 );
    //                 setBotState("idle");
    //             }
    //         }, 30 + Math.random() * 20);
    //     }, 800 + Math.random() * 1000);
    // };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: messages.length + 1,
            from: "user",
            text: inputValue.trim(),
            isTyping: false,
            isThinking: false
        };

        const botMsgId = messages.length + 2;

        const thinkingMsg: Message = {
            id: botMsgId,
            from: "bot",
            text: "",
            isTyping: false,
            isThinking: true
        };

        setMessages((prev) => [...prev, userMsg, thinkingMsg]);
        setInputValue("");
        setBotState("thinking");

        try {
            const requestBody = {
                question: userMsg.text,
                history: messages.map(msg => ({
                    [msg.from]: msg.text
                })) as Array<Record<"user" | "bot", string>>
            };

            const response = await getAssistantResponse(requestBody);

            if (response && response.answer) {
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === botMsgId
                            ? {
                                ...msg,
                                text: "",
                                isThinking: false,
                                isTyping: true
                            }
                            : msg
                    )
                );
                setBotState("typing");

                const fullText = response.answer;
                let currentIndex = 0;

                const interval = setInterval(() => {
                    currentIndex++;
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === botMsgId
                                ? { ...msg, text: fullText.slice(0, currentIndex) }
                                : msg
                        )
                    );

                    if (currentIndex >= fullText.length) {
                        clearInterval(interval);
                        setMessages(prev =>
                            prev.map(msg =>
                                msg.id === botMsgId
                                    ? { ...msg, isTyping: false }
                                    : msg
                            )
                        );
                        setBotState("idle");
                    }
                }, 30 + Math.random() * 20);
            } else {
                throw new Error("Invalid response from assistant.");
            }
        } catch (error) {
            console.error("Failed to get assistant response:", error);
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === botMsgId
                        ? {
                            ...msg,
                            text: "Sorry, something went wrong. Please try again.",
                            isThinking: false,
                            isTyping: false
                        }
                        : msg
                )
            );
            setBotState("idle");
        }
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    return (
        <Box
            height="75vh"
            width={"35vw"}
           // width={["100%", "90%", "70%", "40%"]}
            bg={bgColor}
            boxShadow="2xl"
            borderRadius="2xl"
            overflow="hidden"
            display="flex"
            flexDirection="column"
        >
            <IaAssistantHeader/>
            <Flex
                flex="1"
                direction="column"
                px={4}
                py={2}
                overflowY="auto"
                gap={3}
                bgGradient="linear(to-b, white, gray.50)"
                _dark={{bgGradient: "linear(to-b, gray.800, gray.900)"}}
            >
                <VStack align="stretch" spacing={3}>
                    {messages.map((msg) => (
                        <Flex
                            key={msg.id}
                            alignSelf={msg.from === "user" ? "flex-end" : "flex-start"}
                            maxWidth="85%"
                            align="flex-end"
                            gap={3}
                            flexDirection={msg.from === "user" ? "row-reverse" : "row"}
                        >
                            {msg.from === "bot" ? (
                                <Box
                                    p={1}
                                    borderRadius="full"
                                    bg={botState !== "idle" ? "blue.100" : "transparent"}
                                    _dark={{bg: botState !== "idle" ? "blue.900" : "transparent"}}
                                    transition="background 0.3s ease"
                                >
                                  <RenderBotAvatar botState={botState} />
                                </Box>
                            ) : (
                                <Avatar
                                    size="sm"
                                    name={userName}
                                    bg="blue.500"
                                    color="white"
                                />
                            )}

                            <Box
                                bg={msg.from === "user" ? userBg : botBg}
                                color={msg.from === "user" ? "white" : "inherit"}
                                px={4}
                                py={2}
                                borderRadius="xl"
                                maxW="100%"
                                fontStyle={"normal"}
                                fontWeight={"semibold"}
                                boxShadow="sm"
                                position="relative"
                                transition="all 0.2s ease"
                                _hover={{
                                    transform: 'translateY(-1px)',
                                    boxShadow: 'md'
                                }}
                                borderWidth="1px"
                                borderColor={msg.from === "user" ? "blue.400" : borderColor}
                                overflow="hidden"
                                _before={
                                    msg.from === "bot"
                                        ? {
                                            content: '""',
                                            position: "absolute",
                                            left: "-9px",
                                            bottom: "12px",
                                            width: "18px",
                                            height: "18px",
                                            background: msg.isThinking ? "transparent" : botBg,
                                            borderBottom: `1px solid ${borderColor}`,
                                            borderLeft: `1px solid ${borderColor}`,
                                            transform: "rotate(45deg)",
                                            zIndex: 0,
                                        }
                                        : {
                                            content: '""',
                                            position: "absolute",
                                            right: "-9px",
                                            bottom: "12px",
                                            width: "18px",
                                            height: "18px",
                                            background: userBg,
                                            borderBottom: `1px solid ${userBg}`,
                                            borderRight: `1px solid ${userBg}`,
                                            transform: "rotate(-45deg)",
                                            zIndex: 0,
                                        }
                                }
                            >
                                {msg.isThinking ? (
                                    <HStack spacing={1}>
                                        <Box
                                            as="span"
                                            animation={`${typingDots} 1.4s infinite`}
                                            style={{animationDelay: '0s'}}
                                        >
                                            ●
                                        </Box>
                                        <Box
                                            as="span"
                                            animation={`${typingDots} 1.4s infinite`}
                                            style={{animationDelay: '0.2s'}}
                                        >
                                            ●
                                        </Box>
                                        <Box
                                            as="span"
                                            animation={`${typingDots} 1.4s infinite`}
                                            style={{animationDelay: '0.4s'}}
                                        >
                                            ●
                                        </Box>
                                    </HStack>
                                ) : (
                                    <Text
                                        whiteSpace="pre-wrap"
                                        wordBreak="break-word"
                                    >
                                        {msg.text}
                                    </Text>
                                )}
                            </Box>
                        </Flex>
                    ))}
                </VStack>

                <Box ref={bottomRef}/>
            </Flex>

            <InputContainer
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleSend={handleSend}
            />

        </Box>
    );
};

export default IaAssistant;