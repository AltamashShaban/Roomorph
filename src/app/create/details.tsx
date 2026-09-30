import { Image } from 'expo-image';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button, Chip, Header, Screen, Txt } from '@/components/ui';
import { getRoomType, PROMPT_SUGGESTIONS, QUALITY, type Quality } from '@/config/room-types';
import { getStyle } from '@/config/styles';
import { MAX_USER_PROMPT } from '@/lib/prompt';
import { useAppStore } from '@/store/app-store';
import { colors, fonts, radii, spacing, type } from '@/theme';

export default function Details() {
  const { draft, updateDraft, credits } = useAppStore();
  const prompt = draft.userPrompt ?? '';
  const cost = QUALITY[draft.quality].credits;
  const style = getStyle(draft.styleId);
  const room = getRoomType(draft.roomType);

  const addSuggestion = (s: string) => {
    const next = prompt ? `${prompt.replace(/[,\s]+$/, '')}, ${s.toLowerCase()}` : s;
    updateDraft({ userPrompt: next.slice(0, MAX_USER_PROMPT) });
  };

  const generate = () => {
    if (credits < cost) return router.push('/paywall');
    router.push('/create/generating');
  };

  return (
    <Screen>
      <Header step="Step 4 of 4" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Txt variant="h1">Final touches</Txt>

          {/* Summary */}
          <View style={styles.summary}>
            {draft.photoUri && <Image source={{ uri: draft.photoUri }} style={styles.thumb} contentFit="cover" />}
            <View style={{ flex: 1 }}>
              <Txt variant="label" style={{ color: colors.muted }}>
                {room?.name}
              </Txt>
              <Txt variant="h3" style={{ marginTop: 2 }}>
                {style?.name}
              </Txt>
            </View>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Txt variant="label" style={{ color: colors.accent }}>
                Change
              </Txt>
            </Pressable>
          </View>

          {/* Custom prompt */}
          <Txt variant="label" style={styles.sectionLabel}>
            Add details <Txt variant="small">(optional)</Txt>
          </Txt>
          <View style={styles.inputWrap}>
            <TextInput
              value={prompt}
              onChangeText={(t) => updateDraft({ userPrompt: t.slice(0, MAX_USER_PROMPT) })}
              placeholder="e.g. green velvet sofa, more plants, warm lighting"
              placeholderTextColor={colors.taupe}
              multiline
              maxLength={MAX_USER_PROMPT}
              style={styles.input}
            />
            <Txt variant="small" style={styles.counter}>
              {prompt.length}/{MAX_USER_PROMPT}
            </Txt>
          </View>
          <View style={styles.chips}>
            {PROMPT_SUGGESTIONS.map((s) => (
              <Chip key={s} label={`+ ${s}`} onPress={() => addSuggestion(s)} />
            ))}
          </View>

          {/* Quality */}
          <Txt variant="label" style={styles.sectionLabel}>
            Quality
          </Txt>
          <View style={styles.quality}>
            {(Object.keys(QUALITY) as Quality[]).map((q) => {
              const selected = draft.quality === q;
              return (
                <Pressable key={q} onPress={() => updateDraft({ quality: q })} style={[styles.qCard, selected && styles.qSelected]}>
                  <View style={styles.qTop}>
                    <Txt variant="h3" style={{ color: selected ? colors.onInk : colors.text }}>
                      {QUALITY[q].label}
                    </Txt>
                    <Txt variant="label" style={{ color: selected ? colors.sand : colors.accent }}>
                      {QUALITY[q].credits} {QUALITY[q].credits === 1 ? 'credit' : 'credits'}
                    </Txt>
                  </View>
                  <Txt variant="small" style={{ marginTop: 4, color: selected ? colors.sand : colors.muted, fontSize: 12 }}>
                    {QUALITY[q].note}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button title={`Generate · ${cost} ${cost === 1 ? 'credit' : 'credits'}`} icon="star" onPress={generate} />
          <Txt variant="small" style={{ textAlign: 'center', marginTop: spacing.sm, fontSize: 12 }}>
            You have {credits} {credits === 1 ? 'credit' : 'credits'}
          </Txt>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xl },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: { width: 56, height: 56, borderRadius: radii.sm },
  sectionLabel: { marginTop: spacing.xxl, marginBottom: spacing.md },
  inputWrap: { backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  input: { ...type.body, fontFamily: fonts.sans, minHeight: 84, textAlignVertical: 'top', padding: 0 },
  counter: { alignSelf: 'flex-end', fontSize: 11 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  quality: { flexDirection: 'row', gap: spacing.md },
  qCard: { flex: 1, padding: spacing.lg, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  qSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  qTop: { gap: 2 },
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
});
