/** @jsxImportSource @emotion/react */
import { forwardRef, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { breakpoints, mediaQueries, tokens } from '../../Helpers/styleTokens';
import { useLocation, useNavigate } from 'react-router-dom';
import { NutriButton } from '../NutriButton';
import { css } from '@emotion/react';
import { Icon } from '../Icons/Icon';
import useWindowDimensions from '../../Helpers/useWindowDimensions';
import { Canvas } from '@react-three/fiber';
import { Scene } from '../3D/Scene';
import CanvasDefaultList from '../3D/CanvasDefaultList';
import { osName, isIOS } from "react-device-detect";

const HomepageContentContainer = styled.div`
  margin: 0 auto;
  max-width: ${tokens.maxWidth.xl};
  min-height: calc(100vh - ${tokens.navHeight.lg}); // temp
  overflow: auto;
  overflow-x: hidden;
  padding-top: ${tokens.navHeight.lg};
  position: relative;
  text-align: center;
  z-index: 1;
`
const VideoContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 500px;
  z-index: 0;
  ${mediaQueries({
    top: ["380px", "420px", "470px", "500px"],
    left: ["-45%", "-40%", "-10%", "0",],
    right: ["-45%", "-40%", "-10%", "0",]
  })}
`
const ImageContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  z-index: 0;
  ${mediaQueries({
    // top: ["380px", "420px", "213px", "200px", "180px"],
    // left: ["-45%", "-40%", "-14%", "0",],
    // right: ["-45%", "-40%", "-17%", "-2%",]
    top: ["380px", "420px", "470px", "500px"],
    left: ["-45%", "-40%", "-10%", "0",],
    right: ["-45%", "-40%", "-10%", "0",]
  })}
`

const ViewHeightWrapper = styled.div``

const FirstBlock = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
`

const ArrowSection = styled.div``
const SecondBlock = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-top: 32vw;
  margin-bottom: 4vw;
`

const ThirdBlock = styled.div`
  margin-bottom: 600px; // temp
`
const SectionContent = styled.div``
const Card = styled.div``
const CardContent = styled.div``
const CardSuperment = styled.div``
const CardDescription = styled.div``
const CardButton = styled.div``

const SectionTitle = styled.h2`
  text-transform: uppercase;
  letter-spacing: 4px;
  font-size: 52px;
`

const Video = styled(motion.video)`
  height: 100%;
  width: 100%;
`

const pillsStats = [
  { name: "Strength",   value: 5 },
  { name: "Duration",   value: 3 },
  { name: "Peak Speed", value: 5 }
]
const gummiesStats = [
  { name: "Strength",   value: 5 },
  { name: "Duration",   value: 3 },
  { name: "Peak Speed", value: 5 }
]

const Homepage = forwardRef((props, ref) => {
  // Drei Canvas Refs //
  const refsNames = require("../../Helpers/canvasRefs.json");
  const refs = Object.fromEntries(refsNames.map((prop) => [prop, ref[prop]]));
  
  const videoRef= useRef();
  const discoverScrollRef = useRef(null);
  const location = useLocation();
  const [icebergShadow, setIcebergShadow] = useState(false)
  const [arrowHovered, setArrowHovered] = useState(false)
  const [fillDelay, setFillDelay] = useState(false)
  const [isAppleDevice, setIsAppleDevice] = useState(true);
  
  const { width } = useWindowDimensions()
  
  useEffect(() => {
    if (osName === "Mac OS" || isIOS) {
      console.log('# osName :', osName)
      console.log('# isIOS :', isIOS)
      setIsAppleDevice(true);
    } else {
      setIsAppleDevice(false);
    }
  }, []);

  useEffect(() => {
    if(width > breakpoints[2]) {
      videoRef.current && videoRef.current.play();
    } else {
      videoRef.current && videoRef.current.pause();
    }
  }, [width]);
  
  useEffect(() => {
    if(arrowHovered) {
      const timer = setTimeout(() => {
        setFillDelay(true);
      }, 200)
      return () => clearTimeout(timer);
    } else {
      setFillDelay(false);
    }
  }, [arrowHovered]);
  
  const handleIcebergButtonEnter = () => {
    if(width > breakpoints[2]) {
      setIcebergShadow(true)
      videoRef.current.playbackRate = 2;
    }
  }
  const handleIcebergButtonLeave = () => {
    if(width > breakpoints[2]) {
      setIcebergShadow(false)
      videoRef.current.playbackRate = 0.8;
    }
  }
  
  const scrollToElement = (element) => {
    element && element.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  const icebergVariants = {
    shadow: {
      filter: `drop-shadow(0 0 4px ${tokens.color.accentStrong}`
    },
    default: {
      filter: `drop-shadow(0 0 1px ${tokens.color.transparent}`
    },
    transition: {
      duration: 0.2,
    }
  }

  useEffect(() => {
    const hash = location.hash
    // Check if there is a hash and if an element with that id exists
    const el = hash && document.getElementById(hash.slice(1))
    if (el) {
      el.scrollIntoView({behavior: "smooth"})
    }
  }, [location.hash])
  
  return (
    <>
      {/* Drei Canvas Refs */}
      <CanvasDefaultList ref={ref} />

      <HomepageContentContainer>
        <ViewHeightWrapper>
          
          {/* FIRST BLOCK */}
          <FirstBlock>
            <h2
              css={css`
                margin-bottom: 0;
                text-transform: uppercase;
                ${mediaQueries({
                  fontSize: ["64px", "74px", "94px", "104px", "112px"],
                  letterSpacing: ["4px", "8px", "12px", "14px", "14px"],
                  marginTop: ["59px", "72px", "94px", "114px"],
                })};
              `}
            >
              Nutritiv
            </h2>
            
            {/* <div ref={refs.canvasView1} style={{ display: "inline-block", height: "100px", width: "100px" }} />  */}
            
            <h3
              css={css`
                font-weight: ${tokens.font.fontWeight.regular};
                line-height: 1.65;
                margin: ${tokens.spacing.sm} 0 0;
                text-transform: uppercase;
                letter-spacing: 4px;
                ${mediaQueries({
                  fontSize: ["14px", "20px", "20px", "20px", "20px"],
                })};
              `}
            >
              Get&nbsp;
              <span style={{fontWeight: tokens.font.fontWeight.bold}}>
                superformant
              </span>
              <br/>
              with our&nbsp;
              <span style={{fontWeight: tokens.font.fontWeight.bold}}>
                superments
              </span>
            </h3>
            <div
              onMouseEnter={() => handleIcebergButtonEnter()}
              onMouseLeave={() => handleIcebergButtonLeave()}
              style={{
                borderRadius: tokens.borderRadius.default,
                marginTop: "20px",
              }}
            >
              <NutriButton 
                label="Discover"
                type="filled"
                onClick={() => scrollToElement(discoverScrollRef)}
              />
            </div>
          </FirstBlock>

          {/* SECOND BLOCK */}
          <SecondBlock>
            <h4
              css={css`
                margin-right: 20px;
                margin-left: 20px;
                font-size: ${tokens.font.fontSize.md};
                font-weight: ${tokens.font.fontWeight.bold};
                /* letter-spacing: 1px; */
                line-height: 1.5;
                ${mediaQueries({
                  paddingRight: [
                    "8px", "10px", "15px", "26px"
                  ],
                  marginTop: [
                    "98vw", "80vw", "44vw", "32vw"
                  ],
                  maxWidth: [
                    "480px",
                  ]
                })}
              `}
              ref={discoverScrollRef}
            >
              The human body uses only 20% of its molecules potential.<br/>
              Our superments are exclusive supplements which unlock their hidden potential.<br/>
            </h4>
            <ArrowSection
              css={css`
                margin-top: 7vw;
                ${mediaQueries({
                  paddingRight: [
                    "8px", "10px", "15px", "22px"
                  ],
                  marginTop: [
                    "14vw", "8vw", "6vw", "7vw"
                  ]
                })}
              `}
            >
              <div
                onMouseEnter={() => setArrowHovered(true)}
                onMouseLeave={() => setArrowHovered(false)}
                css={css`
                  cursor: pointer;
                  padding: 4px;
                `}
              >
                <Icon
                  name="arrow-down"
                  color={tokens.color.contrastLight}
                  onClick={() => scrollToElement(discoverScrollRef)}
                  resizeDefault="0 0 25 25"
                  strokeWidth={2}
                  height={25}
                  width={25}
                />
              </div>
              <Icon 
                name="wave"
                color={tokens.color.contrastLight}
                filled={fillDelay}
                hovered={arrowHovered}
                resizeDefault="0 0 65 70"
                resizeFilled="0 0 65 70"
                strokeWidth={2}
                height={35}
                width={35}
              />
            </ArrowSection>
          </SecondBlock>

          {/* THIRD BLOCK */}
          <ThirdBlock
            css={css`
              align-items: center;
              display: flex;
              flex-direction: column;
              padding-right: 6px;
              margin-top: calc(40vh - 7vw);
            `}
          >
            <SectionTitle>
                Shapes
            </SectionTitle>
            <SectionContent
              css={css`
                margin-top: ${tokens.spacing.max};
                perspective: 2000px;
                perspective-origin: center;
                position: relative;
              `}
            >
              <Card
                css={css`
                  background: ${tokens.color.secondary};
                  border-radius: ${tokens.borderRadius.xl};
                  height: 289px;
                  position: relative;
                  transform: rotateX(27deg) rotateY(0deg);
                  transform-style: preserve-3d;
                  width: 812px;
                  z-index: -1;
                  &:before {
                    background: #072564;
                    border-radius: ${tokens.borderRadius.xl};
                    content: "";
                    position: absolute;
                    inset: 0;
                    transform: translateZ(-190px);
                  }
                  &:after {
                    background: #051255;
                    border-radius: ${tokens.borderRadius.xl};
                    content: "";
                    position: absolute;
                    inset: 0;
                    transform: translateZ(-380px);
                  }
                `}
              >
                <label
                  css={css`
                    color: ${tokens.color.primary};
                    font-size: 280px;
                    font-style: italic;
                    font-weight: ${tokens.font.fontWeight.bold};
                    letter-spacing: 24px;
                    opacity: 0.1;
                    position: absolute;
                    top: -13px;
                    bottom: 0;
                    right: 0;
                    left: 34px;
                    text-transform: uppercase;
                  `}
                >
                  Pill
                </label>
              </Card>
              <CardContent
                css={css`
                  align-items: center;
                  display: flex;
                  position: absolute;
                  inset: 0;
                `}
              >
                <CardSuperment
                  css={css`
                    width: 270px;
                  `}
                >
                  <div
                    css={css`
                      background: transparent;
                      position: absolute;
                      left: 0px;
                      height: 300px;
                      width: 270px;
                      top: -58px;
                    `}
                  >
                    {/* <Canvas shadows>
                      
                      <Scene 
                        type="pill"
                        homepageCard
                      />
                    </Canvas> */}
                  </div>
                </CardSuperment>
                <CardDescription
                  css={css`
                    padding-left: 33px;
                    text-align: left;
                    width: 250px;
                  `}
                >
                  <h4
                    css={css`
                      font-size: ${tokens.font.fontSize.md};
                      font-weight: ${tokens.font.fontWeight.medium};
                    `}
                  >
                    The <i>capsule</i> shape
                  </h4>
                  <div
                    css={css`
                      align-items: left;
                      display: flex;
                      font-weight: ${tokens.font.fontWeight.light};
                      flex-direction: column;
                      > div {
                        align-items: center;
                        display: flex;
                        margin-bottom: ${tokens.spacing.sm};
                      }
                    `}
                  >
                    {pillsStats.map((stat, i) => (
                      <div
                        css={css`
                          display: flex;
                          justify-content: space-between;
                        `}
                        key={i}
                      >
                        <label>
                          {stat.name} :
                        </label>
                        <div>
                          {[...Array(stat.value)].map((_, i) => 
                            <Icon
                              color={tokens.color.contrastLight}
                              filled
                              height={20}
                              key={i}
                              name="beaker"
                              style={{
                                marginLeft: "10px"
                              }}
                              width={20}
                            />
                          )}
                          {[...Array(5 - stat.value)].map((_, i) => 
                            <Icon
                              color={tokens.color.contrastLight}
                              height={20}
                              key={i}
                              name="beaker"
                              style={{
                                marginLeft: "10px",
                                opacity: 0.5
                              }}
                              strokeWidth={2}
                              width={20}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardDescription>
                <CardButton
                  css={css`
                    width: 259px;
                  `}
                >
                  <NutriButton 
                    label="Shop Pills"
                    type="filled"
                  />
                </CardButton>
              </CardContent>
            </SectionContent>
          </ThirdBlock>
        </ViewHeightWrapper>
      </HomepageContentContainer>
        {isAppleDevice ? (
          <ImageContainer className="iceberg-container">
            <motion.img 
              animate={
                icebergShadow ? "shadow" : "default" 
              }
              alt="iceberg" 
              id='iceberg-image'
              src="https://nutritiv.s3.eu-west-3.amazonaws.com/assets/image-iceberg.png"
              style={{height: "100%", width: "100%"}} 
              variants={icebergVariants}
            />
          </ImageContainer>
        ) : (
          <VideoContainer className="iceberg-container">
            <Video
              animate={
                icebergShadow ? "shadow" : "default" 
              }
              autoPlay={true}
              id="iceberg-video"
              loop
              muted
              playsInline
              preload="auto"
              ref={videoRef}
              variants={icebergVariants}
              height="100%"
              width="100%"
            >
              <source src="https://nutritiv.s3.eu-west-3.amazonaws.com/assets/video_iceberg.mov" type='video/mp4; codecs="hvc1"'></source>
              <source src="https://nutritiv.s3.eu-west-3.amazonaws.com/assets/video_iceberg.webm" type="video/webm" />
            </Video>
          </VideoContainer>
        )}
    </>
  )
});

export default Homepage;