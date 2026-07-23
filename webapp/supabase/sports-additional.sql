-- PlayMate 추가 종목 시드 데이터
-- seed.sql(아이스하키/피겨스케이팅) 실행 후, 이 파일을 SQL Editor에서 실행하세요.
-- emoji 컬럼은 더 이상 UI에서 읽지 않음(아이콘은 SportIcon 컴포넌트가 담당) — not null 제약만 맞추기 위해 빈 문자열로 채움.

insert into sports (id, name, emoji, category, traits) values
  ('soccer', '축구', '', '구기', array['활동적','팀워크','승부욕']),
  ('baseball', '야구', '', '구기', array['집중력','팀워크','전략적']),
  ('basketball', '농구', '', '구기', array['활동적','팀워크','순발력']),
  ('rugby', '럭비', '', '구기', array['활동적','팀워크','승부욕']),
  ('tennis', '테니스', '', '라켓', array['집중력','개인종목','승부욕']),
  ('golf', '골프', '', '라켓', array['집중력','개인종목','차분함']),
  ('swimming', '수영', '', '수상', array['활동적','개인종목','지구력']),
  ('inline-hockey', '인라인하키', '', '인라인', array['활동적','팀워크','순발력']),
  ('taekwondo', '태권도', '', '격투기', array['승부욕','자신감','집중력']),
  ('ballet', '발레', '', '무용', array['집중력','표현력','유연성']),
  ('korean-dance', '한국무용', '', '무용', array['표현력','차분함','사교적']),
  ('modern-dance', '현대무용', '', '무용', array['표현력','유연성','창의적']),
  ('dance', '댄스', '', '무용', array['표현력','에너지','사교적']);
