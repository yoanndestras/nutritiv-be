import styled from "@emotion/styled";
import { tokens } from "../Helpers/styleTokens";

export const PageContainer = styled.div`
  max-width: ${tokens.maxWidth.xl};
  height: 0;
  left: 0;
  margin: 0 auto;
  position: absolute;
  right: 0;
  top: ${tokens.navHeight};
  width: 100%;
`