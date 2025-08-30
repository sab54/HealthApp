// Client/src/components/SwipeableList.js
/**
 * SwipeableList.js
 * 
 * This file defines the `SwipeableList` component, which is a customizable list that allows users 
 * to swipe list items and perform actions on them. It supports features like infinite scrolling, 
 * pull-to-refresh, and swipeable actions on list items. The component is highly configurable, allowing 
 * developers to define custom item rendering, load more actions, and theme customization.
 * 
 * Features:
 * - Swipeable list items with customizable actions via the `renderRightActions` prop.
 * - Pull-to-refresh functionality with `onRefresh` callback.
 * - Supports infinite scrolling with the ability to load more items.
 * - Customizable icons, labels, and the appearance of the list.
 * - Displays an empty state message when no items are available.
 * - Provides dynamic styling through the `theme` prop.
 * 
 * Props:
 * - `data`: The list of items to display.
 * - `totalCount`: The total number of items (used for pagination).
 * - `loading`: Boolean indicating if data is being loaded.
 * - `refreshing`: Boolean indicating if the list is being refreshed.
 * - `onRefresh`: Callback function to trigger refresh.
 * - `disableLoadMore`: Boolean to disable the "Load More" button.
 * - `theme`: The theme object for customizing colors and styles.
 * - `swipeableRefs`: Reference for managing swipeable components.
 * - `handleSwipeStart`: Callback function triggered when a swipe action begins.
 * - `renderRightActions`: Function to render swipe actions on the right.
 * - `keyExtractor`: Function to provide a unique key for each list item.
 * - `renderItemText`: Function to extract and render text from an item.
 * - `renderItemContainer`: Function to customize how list items are rendered.
 * - `icon`: Icon name to display next to the list item.
 * - `iconColor`: The color of the icon.
 * - `onItemPress`: Callback function triggered when an item is pressed.
 * - `showIcon`: Boolean to determine whether to show the icon.
 * - `emptyText`: Text to display when no items are available.
 * - `onLoadMore`: Callback function to load more items.
 * - `hasMore`: Boolean indicating if there are more items to load.
 * - `ListHeaderComponent`: Component to render at the top of the list.
 * 
 * Dependencies:
 * - `react-native`
 * - `react-native-gesture-handler`
 * - `@expo/vector-icons`
 * 
 * Author: Sunidhi Abhange
 */

import React, { forwardRef, useRef } from 'react';
import {
    ActivityIndicator,
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

const SwipeableList = forwardRef(
    (
        {
            data = [],
            totalCount = 0,
            loading = false,
            refreshing = false,
            onRefresh = () => {},
            disableLoadMore = false,
            theme = {},
            swipeableRefs = { current: [] },
            handleSwipeStart = () => {},
            renderRightActions,
            keyExtractor,
            renderItemText,
            renderItemContainer,
            icon = 'list-outline',
            iconColor,
            onItemPress = () => {},
            showIcon = true,
            emptyText = 'No items available.',
            onLoadMore = () => {},
            hasMore = false,
            ListHeaderComponent = null,
        },
        ref
    ) => {
        const isSwipingRef = useRef(false);
        const scrollToBottom = () => {
            ref?.current?.scrollToEnd?.({ animated: true });
        };

        const safeKeyExtractor = (item, index) => {
            if (keyExtractor) return keyExtractor(item, index);
            if (item?.url) return `${item.url}-${index}`;
            if (item?.id) return `id-${item.id}-${index}`;
            return `item-${index}`;
        };

        const renderItem = ({ item, index }) => {
            const content = (
                <>
                    {showIcon && (
                        <Ionicons
                            name={icon}
                            size={24}
                            color={iconColor || theme.text || '#000'}
                            style={styles.icon}
                        />
                    )}
                    <View style={styles.textWrapper}>
                        {(() => {
                            const result = renderItemText(item);
                            if (typeof result === 'string') {
                                return (
                                    <Text
                                        style={{ color: theme.text || '#000' }}
                                    >
                                        {result}
                                    </Text>
                                );
                            }
                            if (React.isValidElement(result)) {
                                return result;
                            }
                            return null;
                        })()}
                    </View>
                </>
            );

            return (
                <View style={styles.swipeContainer}>
                    <Swipeable
                        ref={(r) => (swipeableRefs.current[index] = r)}
                        renderRightActions={(progress, dragX) => (
                            <View style={styles.swipeActionsWrapper}>
                                {renderRightActions?.(
                                    item,
                                    index,
                                    progress,
                                    dragX
                                )}
                            </View>
                        )}
                        friction={1}
                        rightThreshold={20}
                        overshootRight={false}
                        onSwipeableWillOpen={() => {
                            isSwipingRef.current = true;
                            handleSwipeStart(index);
                        }}
                    >
                        {renderItemContainer ? (
                            renderItemContainer(item, content, onItemPress)
                        ) : (
                            <TouchableOpacity
                                style={[
                                    styles.item,
                                    {
                                        backgroundColor: theme.card || '#fff',
                                        borderColor:
                                            theme.border ||
                                            (theme.text || '#000') + '22',
                                    },
                                ]}
                                activeOpacity={0.8}
                                onPress={() => {
                                    if (!isSwipingRef.current) {
                                        onItemPress(item);
                                    }
                                    setTimeout(() => {
                                        isSwipingRef.current = false;
                                    }, 100);
                                }}
                            >
                                {content}
                            </TouchableOpacity>
                        )}
                    </Swipeable>
                </View>
            );
        };

        const renderFooter = () => {
            if (!hasMore && data.length > 0) {
                return (
                    <Text
                        style={[styles.meta, { color: theme.text || '#000' }]}
                    >
                        Showing {data.length} of {totalCount}
                    </Text>
                );
            }

            return (
                <View style={styles.footer}>
                    <Text
                        style={[styles.meta, { color: theme.text || '#000' }]}
                    >
                        Showing {data.length} of {totalCount}
                    </Text>

                    {loading ? (
                        <ActivityIndicator
                            size='small'
                            color={theme.text || '#000'}
                            style={{ marginTop: 10 }}
                        />
                    ) : (
                        <TouchableOpacity
                            onPress={() => {
                                onLoadMore?.();
                                setTimeout(scrollToBottom, 300);
                            }}
                            style={[
                                styles.loadMoreBtn,
                                {
                                    borderColor: theme.primary || '#007AFF',
                                    opacity: disableLoadMore ? 0.5 : 1,
                                },
                            ]}
                            disabled={disableLoadMore}
                        >
                            <Text
                                style={[
                                    styles.loadMoreText,
                                    { color: theme.primary || '#007AFF' },
                                ]}
                            >
                                Load More
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        };

        const renderEmpty = () => {
            if (loading) return null;
            return (
                <Text style={[styles.text, { color: theme.text || '#000' }]}>
                    {emptyText}
                </Text>
            );
        };

        return (
            <FlatList
                ref={ref}
                data={data}
                keyExtractor={safeKeyExtractor}
                renderItem={renderItem}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                ListHeaderComponent={ListHeaderComponent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                contentContainerStyle={{ paddingBottom: 80 }}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        );
    }
);

const styles = StyleSheet.create({
    swipeContainer: {
        backgroundColor: 'transparent',
        borderRadius: 12,
        marginBottom: 10,
        overflow: 'hidden',
    },
    text: {
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    icon: {
        marginRight: 10,
        marginTop: 3,
    },
    textWrapper: {
        flex: 1,
    },
    swipeActionsWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    meta: {
        fontSize: 13,
        opacity: 0.6,
        textAlign: 'center',
        marginBottom: 8,
    },
    loadMoreBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderWidth: 1.5,
        borderRadius: 25,
        marginTop: 8,
    },
    loadMoreText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default SwipeableList;
